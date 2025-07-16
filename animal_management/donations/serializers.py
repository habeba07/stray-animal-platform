from rest_framework import serializers
from .models import DonationCampaign, Donation
from users.serializers import UserSerializer
from animals.serializers import AnimalSerializer
from .models import DonationCampaign, Donation, RecurringDonation, Budget, FinancialReport, ImpactCategory

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

class BudgetSerializer(serializers.ModelSerializer):
    impact_category_name = serializers.CharField(source='impact_category.name', read_only=True)
    spent_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    remaining_budget = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    budget_utilization = serializers.FloatField(read_only=True)
    
    class Meta:
        model = Budget
        fields = ['id', 'impact_category', 'impact_category_name', 'year', 'quarter', 
                 'allocated_amount', 'spent_amount', 'remaining_budget', 'budget_utilization', 
                 'created_at', 'updated_at']

class FinancialReportSerializer(serializers.ModelSerializer):
    generated_by_username = serializers.CharField(source='generated_by.username', read_only=True)
    
    class Meta:
        model = FinancialReport
        fields = ['id', 'name', 'report_type', 'start_date', 'end_date', 
                 'report_data', 'generated_by', 'generated_by_username', 'generated_at']

class ImpactCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ImpactCategory
        fields = ['id', 'name', 'category_type', 'description', 'icon', 'color', 'cost_per_unit', 'unit_name']
