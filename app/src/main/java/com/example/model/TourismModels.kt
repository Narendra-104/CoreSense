package com.example.model

enum class TourismCategory(val title: String, val iconName: String) {
    ALL("All", "Explore"),
    MONUMENTS("ASI Monuments", "AccountBalance"),
    GUIDES("Verified Guides", "Badge"),
    CABS("Safe Transit", "DirectionsCar"),
    HOTELS("Certified Stays", "Hotel")
}

enum class CrowdLevel(val label: String, val footfallPercentage: Int) {
    LOW("Low Crowd (Pleasant)", 25),
    MODERATE("Moderate Crowd", 55),
    HIGH("Heavy Footfall (Peak)", 90)
}

data class AttractionItem(
    val id: String,
    val name: String,
    val city: String,
    val state: String,
    val officialPriceInr: Double,
    val timeSlot: String,
    val crowdLevel: CrowdLevel,
    val safetyScore: Double, // out of 5.0
    val safeHours: String,
    val description: String,
    val asiCode: String,
    val audioGuideAvailable: Boolean = true,
    val wheelchairAccessible: Boolean = true,
    val imageRes: String? = null
)

data class VerifiedGuide(
    val id: String,
    val name: String,
    val badgeNumber: String,
    val blockchainNftHash: String,
    val city: String,
    val languages: List<String>,
    val experienceYears: Int,
    val rating: Double,
    val reviewsCount: Int,
    val ratePerHourInr: Double,
    val specialization: String,
    val isAvailable: Boolean = true,
    val phone: String = "+91 98765 43210"
)

data class TransitOption(
    val id: String,
    val type: String, // "Pre-paid Taxi", "Govt Electric Shuttle", "Verified Auto", "Metro Tourist Pass"
    val provider: String,
    val officialRatePerKmOrPass: Double,
    val routeDescription: String,
    val safetyRating: Double,
    val isGpsTracked: Boolean = true,
    val driverName: String,
    val vehicleNumber: String,
    val fixedFareGuarantee: Boolean = true
)

data class StayOption(
    val id: String,
    val name: String,
    val type: String, // "State Tourism Resort", "Heritage Homestay", "Verified Safe Stay"
    val city: String,
    val pricePerNightInr: Double,
    val safetyRating: Double,
    val govtCertifiedBadge: String,
    val amenities: List<String>
)

enum class AlertSeverity {
    INFO,
    WARNING,
    CRITICAL
}

data class SafetyAlert(
    val id: String,
    val title: String,
    val location: String,
    val message: String,
    val safeAlternate: String,
    val safeTimeSlot: String,
    val severity: AlertSeverity,
    val timeAgo: String
)

enum class EmergencyType(val title: String, val dialNumber: String, val description: String) {
    POLICE("Police & Security", "112", "Threat, harassment, theft or immediate police assistance"),
    AMBULANCE("Medical & Ambulance", "108", "Medical emergency, injury or health crisis"),
    DISASTER("Evacuation & Disaster", "1077", "Natural disaster, flash flood or fire incident")
}

data class EmergencyTelemetry(
    val isDispatched: Boolean = false,
    val emergencyType: EmergencyType? = null,
    val timestamp: String = "",
    val coordinates: String = "27.1751° N, 78.0421° E",
    val accuracyMeters: Int = 4,
    val batteryPercent: Int = 89,
    val dispatchReferenceId: String = "",
    val policeStationAssigned: String = "Agra Cantt Tourist Police Unit",
    val etaMinutes: Int = 4,
    val sirenPlaying: Boolean = false
)

data class BhashiniLanguage(
    val code: String,
    val displayName: String,
    val nativeName: String
)

data class QuickPhrase(
    val category: String,
    val englishText: String,
    val hindiText: String,
    val pronunciation: String
)

data class BookingPass(
    val id: String,
    val title: String,
    val category: String,
    val details: String,
    val amountPaidInr: Double,
    val qrCodeData: String,
    val verificationHash: String,
    val date: String,
    val timeSlot: String,
    val touristName: String,
    val status: String = "CONFIRMED & ACTIVE"
)

enum class AppMode {
    TOURIST,
    SERVICE_PROVIDER
}

enum class ProviderType {
    LOCAL_GUIDE,
    CAB_DRIVER,
    HOTEL_OWNER
}

data class ProviderProfile(
    val name: String,
    val type: ProviderType,
    val idNumber: String,
    val blockchainCredentialId: String,
    val verifiedBy: String,
    val completedTripsOrTours: Int,
    val safetyScore: Double,
    val earningsTodayInr: Double,
    val fixedTariffLocked: Boolean = true
)

data class UserProfile(
    val id: String,
    val name: String,
    val emailOrPhone: String,
    val role: AppMode,
    val avatarInitials: String = "HT",
    val providerType: ProviderType? = null,
    val badgeNumber: String? = null,
    val preferredLanguage: String = "en",
    val emergencyContact: String = "112",
    val isGovtVerified: Boolean = true
)

enum class AuthTab(val label: String) {
    TOURIST("Tourist / Explorer"),
    SERVICE_PROVIDER("Verified Provider")
}

