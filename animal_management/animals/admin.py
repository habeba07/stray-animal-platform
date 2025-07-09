from django.contrib import admin
from .models import Animal

@admin.register(Animal)
class AnimalAdmin(admin.ModelAdmin):
    list_display = ('name', 'animal_type', 'gender', 'status', 'current_shelter', 'created_at')
    list_filter = ('animal_type', 'gender', 'status', 'vaccinated', 'neutered_spayed')
    search_fields = ('name', 'breed', 'color')
    readonly_fields = ('created_at', 'updated_at')