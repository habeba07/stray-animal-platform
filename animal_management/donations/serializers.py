from rest_framework import serializers
from .models import DonationCampaign, Donation
from users.serializers import UserSerializer
from animals.serializers import AnimalSerializer
from .models import DonationCampaign, Donation, RecurringDonation

class DonationCampaignSerializer(serializers.ModelSerializer):
    created_by_details = UserSerializer(source='created_by', read_only=True)
    animal_details = AnimalSerializer(source='animal', read_only=True)
    
    class Meta:
        model = DonationCampaign
        fields = '__all__'
        read_only_fields = ['created_by', 'current_amount', 'created_at', 'updated_at']


class DonationSerializer(serializers.ModelSerializer):
    donor_details = UserSerializer(source='donor', read_only=True)
    campaign_details = DonationCampaignSerializer(source='campaign', read_only=True)
    
    class Meta:
        model = Donation
        fields = '__all__'
        read_only_fields = ['donor', 'created_at']

class RecurringDonationSerializer(serializers.ModelSerializer):
    donor_details = UserSerializer(source='donor', read_only=True)
    campaign_details = DonationCampaignSerializer(source='campaign', read_only=True)
    
    class Meta:
        model = RecurringDonation
        fields = '__all__'
        read_only_fields = ['donor', 'total_donated', 'successful_payments', 'failed_payments', 
                           'last_payment_date', 'next_payment_date', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        # Calculate next payment date when creating
        recurring_donation = RecurringDonation(**validated_data)
        recurring_donation.next_payment_date = recurring_donation.calculate_next_payment_date()
        recurring_donation.save()
        return recurring_donation
