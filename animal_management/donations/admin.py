from django.contrib import admin
from .models import DonationCampaign, Donation, RecurringDonation

@admin.register(DonationCampaign)
class DonationCampaignAdmin(admin.ModelAdmin):
    list_display = ('title', 'campaign_type', 'target_amount', 'current_amount', 'is_active', 'created_at')
    list_filter = ('campaign_type', 'is_active')
    search_fields = ('title', 'description')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    list_display = ('donor', 'campaign', 'amount', 'payment_method', 'created_at')
    list_filter = ('payment_method', 'created_at')
    search_fields = ('donor__username', 'campaign__title')
    readonly_fields = ('created_at',)

@admin.register(RecurringDonation)
class RecurringDonationAdmin(admin.ModelAdmin):
    list_display = ('donor', 'amount', 'frequency', 'status', 'next_payment_date', 'successful_payments', 'total_donated')
    list_filter = ('status', 'frequency', 'payment_method', 'created_at')
    search_fields = ('donor__username', 'campaign__title')
    readonly_fields = ('created_at', 'updated_at', 'total_donated', 'successful_payments', 'failed_payments', 'last_payment_date')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('donor', 'campaign', 'amount', 'frequency', 'payment_method')
        }),
        ('Subscription Status', {
            'fields': ('status', 'start_date', 'next_payment_date', 'end_date')
        }),
        ('Tracking', {
            'fields': ('total_donated', 'successful_payments', 'failed_payments', 'last_payment_date'),
            'classes': ('collapse',)
        }),
        ('Optional', {
            'fields': ('is_anonymous', 'message'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['cancel_subscriptions', 'pause_subscriptions', 'resume_subscriptions']
    
    def cancel_subscriptions(self, request, queryset):
        count = 0
        for recurring_donation in queryset:
            if recurring_donation.status in ['ACTIVE', 'PAUSED']:
                recurring_donation.cancel()
                count += 1
        self.message_user(request, f'{count} recurring donations cancelled.')
    cancel_subscriptions.short_description = "Cancel selected recurring donations"
    
    def pause_subscriptions(self, request, queryset):
        count = 0
        for recurring_donation in queryset:
            if recurring_donation.status == 'ACTIVE':
                recurring_donation.pause()
                count += 1
        self.message_user(request, f'{count} recurring donations paused.')
    pause_subscriptions.short_description = "Pause selected recurring donations"
    
    def resume_subscriptions(self, request, queryset):
        count = 0
        for recurring_donation in queryset:
            if recurring_donation.status == 'PAUSED':
                recurring_donation.resume()
                count += 1
        self.message_user(request, f'{count} recurring donations resumed.')
    resume_subscriptions.short_description = "Resume selected recurring donations"