from rest_framework import serializers
from .models import VaccinationRecord, MedicalRecord, HealthStatus
from animals.models import Animal

class VaccinationRecordSerializer(serializers.ModelSerializer):
    inventory_item_data = serializers.DictField(write_only=True, required=False)
    
    class Meta:
        model = VaccinationRecord
        fields = ['id', 'animal', 'vaccine_type', 'vaccine_name', 'date_administered', 
                  'next_due_date', 'veterinarian', 'clinic_name', 'batch_number', 
                  'notes', 'inventory_item_data', 'created_by', 'created_at', 'updated_at']
        read_only_fields = ['created_by', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        # Extract inventory data
        inventory_data = validated_data.pop('inventory_item_data', None)
        
        # Create vaccination record
        vaccination = VaccinationRecord.objects.create(**validated_data)
        
        # Connect to inventory if provided
        if inventory_data:
            from inventory.models import InventoryItem
            try:
                inventory_item = InventoryItem.objects.get(id=inventory_data['id'])
                vaccination.inventory_item = inventory_item
                vaccination.quantity_used = inventory_data.get('quantity_used', 1.0)
                vaccination.save()
            except InventoryItem.DoesNotExist:
                pass
        
        return vaccination


class MedicalRecordSerializer(serializers.ModelSerializer):
    medical_supplies_used = serializers.ListField(
        child=serializers.DictField(), 
        write_only=True, 
        required=False
    )
    
    class Meta:
        model = MedicalRecord
        fields = ['id', 'animal', 'record_type', 'date', 'veterinarian', 
                  'clinic_name', 'reason', 'diagnosis', 'treatment', 'medications', 
                  'follow_up_required', 'follow_up_date', 'attachments', 
                  'medical_supplies_used', 'created_by', 'created_at', 'updated_at']
        read_only_fields = ['created_by', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        # Extract medical supplies data
        medical_supplies_data = validated_data.pop('medical_supplies_used', [])
        
        # Create the medical record
        medical_record = MedicalRecord.objects.create(**validated_data)
        
        # Create medical supply usage records
        for supply_data in medical_supplies_data:
            from .models import MedicalSupplyUsage
            from inventory.models import InventoryItem
            
            inventory_item = InventoryItem.objects.get(id=supply_data['inventory_item'])
            MedicalSupplyUsage.objects.create(
                medical_record=medical_record,
                inventory_item=inventory_item,
                quantity_used=supply_data['quantity_used']
            )
        
        return medical_record


class HealthStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthStatus
        fields = ['id', 'animal', 'current_status', 'last_checkup_date', 
                  'next_checkup_date', 'weight', 'temperature', 'notes', 
                  'updated_by', 'updated_at']
        read_only_fields = ['updated_by', 'updated_at']


class AnimalHealthSummarySerializer(serializers.ModelSerializer):
    vaccinations = VaccinationRecordSerializer(many=True, read_only=True)
    medical_records = MedicalRecordSerializer(many=True, read_only=True)
    health_status_record = HealthStatusSerializer(read_only=True)
    
    class Meta:
        model = Animal
        fields = ['id', 'name', 'animal_type', 'health_status_record', 
                  'vaccinations', 'medical_records']
