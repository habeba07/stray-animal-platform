from django.contrib import admin
from .models import UserActivity, Reward, RewardRedemption, Achievement, UserAchievement

@admin.register(UserActivity)
class UserActivityAdmin(admin.ModelAdmin):
    list_display = ('user', 'activity_type', 'points_earned', 'created_at')
    list_filter = ('activity_type', 'created_at')
    search_fields = ('user__username', 'description')
    readonly_fields = ('created_at',)

@admin.register(Reward)
class RewardAdmin(admin.ModelAdmin):
    list_display = ('name', 'reward_type', 'points_required', 'quantity_available', 'is_active')
    list_filter = ('reward_type', 'is_active')
    search_fields = ('name', 'description')

@admin.register(RewardRedemption)
class RewardRedemptionAdmin(admin.ModelAdmin):
    list_display = ('user', 'reward', 'points_spent', 'status', 'redemption_date')
    list_filter = ('status', 'redemption_date')
    search_fields = ('user__username', 'reward__name')
    readonly_fields = ('redemption_date',)

@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'points_reward', 'is_active')
    list_filter = ('category', 'is_active')
    search_fields = ('name', 'description')

@admin.register(UserAchievement)
class UserAchievementAdmin(admin.ModelAdmin):
    list_display = ('user', 'achievement', 'earned_at')
    list_filter = ('earned_at', 'achievement__category')
    search_fields = ('user__username', 'achievement__name')
    readonly_fields = ('earned_at',)
