from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

def send_donation_receipt(donation):
    """
    Send a professional donation receipt email to the donor.
    
    Args:
        donation: Donation instance
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        # Determine recipient email
        recipient_email = None
        if donation.donor and donation.donor.email:
            recipient_email = donation.donor.email
        elif donation.donor_email:
            recipient_email = donation.donor_email
        
        if not recipient_email:
            logger.warning(f"No email address found for donation {donation.id}")
            return False
        
        # Don't send receipts for anonymous donations unless they provided an email
        if donation.is_anonymous and not donation.donor_email:
            logger.info(f"Skipping receipt for anonymous donation {donation.id} - no email provided")
            return True  # Not an error, just no email to send to
        
        # Prepare email context
        context = {
            'donation': donation,
            'current_year': datetime.now().year,
            'organization_name': 'PAW Rescue',
            'organization_email': getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@pawrescue.com'),
        }
        
        # Render HTML email template
        html_message = render_to_string('donations/receipt_email.html', context)
        
        # Create plain text version by stripping HTML tags
        plain_message = strip_tags(html_message)
        
        # Determine donor name for subject
        donor_name = donation.donor_name or "Anonymous"
        if donation.donor and not donation.is_anonymous:
            donor_name = f"{donation.donor.first_name} {donation.donor.last_name}".strip() or donation.donor.username
        
        # Email subject
        subject = f"Thank You! Your Donation Receipt from PAW Rescue - ${donation.amount}"
        
        # Send email
        success = send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient_email],
            html_message=html_message,
            fail_silently=False,  # Raise exceptions for debugging
        )
        
        if success:
            logger.info(f"Donation receipt sent successfully to {recipient_email} for donation {donation.id}")
            return True
        else:
            logger.error(f"Failed to send donation receipt to {recipient_email} for donation {donation.id}")
            return False
            
    except Exception as e:
        logger.error(f"Error sending donation receipt for donation {donation.id}: {str(e)}")
        return False


def send_donation_notification_to_staff(donation):
    """
    Send notification email to staff about significant donations.
    
    Args:
        donation: Donation instance
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        # Only send notifications for donations >= $100
        if donation.amount < 100:
            return True
        
        # Get staff email addresses
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        staff_emails = list(
            User.objects.filter(
                user_type__in=['STAFF', 'SHELTER'],
                email__isnull=False,
                is_active=True
            ).values_list('email', flat=True)
        )
        
        if not staff_emails:
            logger.warning("No staff email addresses found for donation notification")
            return True
        
        # Prepare email context
        donor_display = "Anonymous" if donation.is_anonymous else (donation.donor_name or "Unknown Donor")
        campaign_name = donation.campaign.title if donation.campaign else "General Fund"
        
        subject = f"🎉 Significant Donation Received: ${donation.amount}"
        
        message = f"""
A significant donation has been received!

Donation Details:
- Amount: ${donation.amount}
- Donor: {donor_display}
- Campaign: {campaign_name}
- Date: {donation.created_at.strftime('%B %d, %Y at %I:%M %p')}
- Transaction ID: {donation.transaction_id}

{f'Message from donor: "{donation.message}"' if donation.message else ''}

This donation has been automatically processed and a receipt has been sent to the donor.

Best regards,
PAW Rescue System
        """
        
        # Send notification email
        success = send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=staff_emails,
            fail_silently=False,
        )
        
        if success:
            logger.info(f"Staff notification sent for donation {donation.id} to {len(staff_emails)} recipients")
            return True
        else:
            logger.error(f"Failed to send staff notification for donation {donation.id}")
            return False
            
    except Exception as e:
        logger.error(f"Error sending staff notification for donation {donation.id}: {str(e)}")
        return False


def send_campaign_milestone_notification(campaign):
    """
    Send notification when a campaign reaches milestones (25%, 50%, 75%, 100%).
    
    Args:
        campaign: DonationCampaign instance
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        # Calculate progress percentage
        if campaign.target_amount <= 0:
            return True
            
        progress_percentage = (campaign.current_amount / campaign.target_amount) * 100
        
        # Define milestone thresholds
        milestones = [25, 50, 75, 100]
        
        # Check if we've hit a milestone (within 1% to avoid multiple sends)
        milestone_hit = None
        for milestone in milestones:
            if abs(progress_percentage - milestone) <= 1.0:
                milestone_hit = milestone
                break
        
        if not milestone_hit:
            return True
        
        # Get campaign creator and staff emails
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        recipient_emails = []
        
        # Add campaign creator
        if campaign.created_by and campaign.created_by.email:
            recipient_emails.append(campaign.created_by.email)
        
        # Add staff members
        staff_emails = list(
            User.objects.filter(
                user_type__in=['STAFF', 'SHELTER'],
                email__isnull=False,
                is_active=True
            ).values_list('email', flat=True)
        )
        recipient_emails.extend(staff_emails)
        
        # Remove duplicates
        recipient_emails = list(set(recipient_emails))
        
        if not recipient_emails:
            return True
        
        # Create milestone message
        if milestone_hit == 100:
            emoji = "🎉"
            milestone_text = "FULLY FUNDED"
            congratulations = "Congratulations! The campaign has reached its goal!"
        elif milestone_hit >= 75:
            emoji = "🌟"
            milestone_text = f"{milestone_hit}% FUNDED"
            congratulations = "Almost there! The campaign is nearly fully funded!"
        elif milestone_hit >= 50:
            emoji = "📈"
            milestone_text = f"{milestone_hit}% FUNDED"
            congratulations = "Great progress! The campaign is halfway to its goal!"
        else:
            emoji = "🚀"
            milestone_text = f"{milestone_hit}% FUNDED"
            congratulations = "Excellent start! The campaign has reached its first milestone!"
        
        subject = f"{emoji} Campaign Milestone: {campaign.title} is {milestone_text}!"
        
        message = f"""
{congratulations}

Campaign: {campaign.title}
Progress: ${campaign.current_amount:,.2f} / ${campaign.target_amount:,.2f} ({progress_percentage:.1f}%)
Milestone: {milestone_hit}% Funded

{campaign.description}

Keep up the great work spreading the word about this important cause!

Best regards,
PAW Rescue Team
        """
        
        # Send notification
        success = send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=recipient_emails,
            fail_silently=False,
        )
        
        if success:
            logger.info(f"Milestone notification sent for campaign {campaign.id} - {milestone_hit}% milestone")
            return True
        else:
            logger.error(f"Failed to send milestone notification for campaign {campaign.id}")
            return False
            
    except Exception as e:
        logger.error(f"Error sending milestone notification for campaign {campaign.id}: {str(e)}")
        return False