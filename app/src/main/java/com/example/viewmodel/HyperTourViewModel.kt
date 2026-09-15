package com.example.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.SampleTourismData
import com.example.model.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

enum class TouristTab(val label: String) {
    EXPLORE("Explore & Book"),
    SAFETY_RADAR("AI Safety & SOS"),
    TRANSLATOR("Bhashini AI"),
    AI_PLANNER("Smart Plan"),
    PASSES("My Passes")
}

data class HyperTourUiState(
    val isAuthenticated: Boolean = false,
    val currentUser: UserProfile? = null,
    val isAuthenticating: Boolean = false,
    val authError: String? = null,
    val appMode: AppMode = AppMode.TOURIST,
    val currentTouristTab: TouristTab = TouristTab.EXPLORE,
    val selectedCategory: TourismCategory = TourismCategory.ALL,
    val selectedCity: String = "All Cities",
    val searchQuery: String = "",
    val attractions: List<AttractionItem> = SampleTourismData.sampleAttractions,
    val guides: List<VerifiedGuide> = SampleTourismData.sampleGuides,
    val transits: List<TransitOption> = SampleTourismData.sampleTransits,
    val stays: List<StayOption> = SampleTourismData.sampleStays,
    val safetyAlerts: List<SafetyAlert> = SampleTourismData.sampleSafetyAlerts,
    val myPasses: List<BookingPass> = SampleTourismData.defaultPasses,
    val emergencyTelemetry: EmergencyTelemetry = EmergencyTelemetry(),
    val isSosActive: Boolean = false,
    val selectedLanguageFrom: BhashiniLanguage = SampleTourismData.supportedLanguages[0], // English
    val selectedLanguageTo: BhashiniLanguage = SampleTourismData.supportedLanguages[1], // Hindi
    val translationInput: String = "",
    val translatedOutput: String = "",
    val translationPhonetic: String = "",
    val isTranslating: Boolean = false,
    val aiPlannerQuery: String = "1-Day Heritage & Safe Tour in Agra with low crowd slots and local cuisine",
    val aiPlannerResponse: String = "",
    val isGeneratingPlan: Boolean = false,
    val activeBookingItem: Any? = null,
    val bookingSuccessMessage: String? = null,
    val isProviderVerified: Boolean = true,
    val providerEarningsToday: Double = 3250.0,
    val providerTripsCompleted: Int = 5,
    val scannedCheckInResult: String? = null
)

class HyperTourViewModel : ViewModel() {

    private val _uiState = MutableStateFlow(HyperTourUiState())
    val uiState: StateFlow<HyperTourUiState> = _uiState.asStateFlow()

    // Auth functions
    fun loginTourist(name: String, contact: String, emergencyContact: String = "112") {
        val userName = if (name.isNotBlank()) name.trim() else "Tourist Explorer"
        val userContact = if (contact.isNotBlank()) contact.trim() else "+91 98765 00000"
        val initials = userName.split(" ")
            .filter { it.isNotEmpty() }
            .take(2)
            .map { it.first().uppercaseChar() }
            .joinToString("")
            .ifEmpty { "TX" }

        val profile = UserProfile(
            id = "USR-T-" + (1000..9999).random(),
            name = userName,
            emailOrPhone = userContact,
            role = AppMode.TOURIST,
            avatarInitials = initials,
            emergencyContact = emergencyContact.ifBlank { "112" },
            isGovtVerified = true
        )

        _uiState.update {
            it.copy(
                isAuthenticated = true,
                currentUser = profile,
                appMode = AppMode.TOURIST,
                authError = null,
                isAuthenticating = false
            )
        }
    }

    fun loginProvider(name: String, contactOrBadge: String, providerType: ProviderType) {
        val providerName = if (name.isNotBlank()) name.trim() else "Authorized Partner"
        val badge = if (contactOrBadge.isNotBlank()) contactOrBadge.trim() else "ASI-LIC-${(1000..9999).random()}"
        val initials = providerName.split(" ")
            .filter { it.isNotEmpty() }
            .take(2)
            .map { it.first().uppercaseChar() }
            .joinToString("")
            .ifEmpty { "PR" }

        val profile = UserProfile(
            id = "USR-P-" + (1000..9999).random(),
            name = providerName,
            emailOrPhone = badge,
            role = AppMode.SERVICE_PROVIDER,
            avatarInitials = initials,
            providerType = providerType,
            badgeNumber = badge,
            isGovtVerified = true
        )

        _uiState.update {
            it.copy(
                isAuthenticated = true,
                currentUser = profile,
                appMode = AppMode.SERVICE_PROVIDER,
                authError = null,
                isAuthenticating = false
            )
        }
    }

    fun loginDemoTourist() {
        loginTourist(
            name = "Alex Morgan",
            contact = "alex.morgan@tourist.org",
            emergencyContact = "+91 98765 43210"
        )
    }

    fun loginDemoProvider() {
        loginProvider(
            name = "Rajesh Sharma",
            contactOrBadge = "ASI-LIC-UP-8842",
            providerType = ProviderType.LOCAL_GUIDE
        )
    }

    fun logout() {
        _uiState.update {
            it.copy(
                isAuthenticated = false,
                currentUser = null,
                authError = null,
                isSosActive = false,
                emergencyTelemetry = EmergencyTelemetry(isDispatched = false, sirenPlaying = false)
            )
        }
    }

    fun setAuthError(message: String?) {
        _uiState.update { it.copy(authError = message) }
    }

    fun setAppMode(mode: AppMode) {
        _uiState.update { it.copy(appMode = mode) }
    }

    fun setTouristTab(tab: TouristTab) {
        _uiState.update { it.copy(currentTouristTab = tab) }
    }

    fun setCategory(category: TourismCategory) {
        _uiState.update { it.copy(selectedCategory = category) }
    }

    fun setCity(city: String) {
        _uiState.update { it.copy(selectedCity = city) }
    }

    fun setSearchQuery(query: String) {
        _uiState.update { it.copy(searchQuery = query) }
    }

    fun openBooking(item: Any) {
        _uiState.update { it.copy(activeBookingItem = item, bookingSuccessMessage = null) }
    }

    fun closeBooking() {
        _uiState.update { it.copy(activeBookingItem = null) }
    }

    fun confirmBooking(title: String, category: String, details: String, amount: Double) {
        val randomSuffix = (1000..9999).random()
        val randomHash = "0x" + UUID.randomUUID().toString().take(8).uppercase()
        val simpleDateFormat = SimpleDateFormat("dd MMM yyyy", Locale.getDefault())
        val dateString = simpleDateFormat.format(Date())

        val newPass = BookingPass(
            id = "PASS-HT-$randomSuffix",
            title = title,
            category = category,
            details = details,
            amountPaidInr = amount,
            qrCodeData = "HYPERTOUR-$category-$randomSuffix-$randomHash",
            verificationHash = randomHash,
            date = dateString,
            timeSlot = "Valid All Day (Guaranteed Fixed Rate)",
            touristName = "Alex Morgan",
            status = "CONFIRMED & PROTECTED"
        )

        _uiState.update {
            it.copy(
                myPasses = listOf(newPass) + it.myPasses,
                activeBookingItem = null,
                bookingSuccessMessage = "Booking Confirmed! Protected Official Fare locked into your offline Pass Wallet."
            )
        }
    }

    fun dismissSuccessMessage() {
        _uiState.update { it.copy(bookingSuccessMessage = null) }
    }

    // Emergency SOS Logic
    fun triggerSos(type: EmergencyType) {
        val sdf = SimpleDateFormat("HH:mm:ss", Locale.getDefault())
        val timeNow = sdf.format(Date())
        val dispatchId = "ERSS-112-IN-" + (100000..999999).random()

        _uiState.update {
            it.copy(
                isSosActive = true,
                emergencyTelemetry = EmergencyTelemetry(
                    isDispatched = true,
                    emergencyType = type,
                    timestamp = timeNow,
                    coordinates = "27.1751° N, 78.0421° E (Near Taj East Corridor)",
                    accuracyMeters = 3,
                    batteryPercent = 88,
                    dispatchReferenceId = dispatchId,
                    policeStationAssigned = "Agra Tourism ERSS Quick Response Vehicle (QRV-04)",
                    etaMinutes = 3,
                    sirenPlaying = true
                )
            )
        }
    }

    fun toggleSiren() {
        _uiState.update {
            val current = it.emergencyTelemetry
            it.copy(emergencyTelemetry = current.copy(sirenPlaying = !current.sirenPlaying))
        }
    }

    fun cancelSos() {
        _uiState.update {
            it.copy(
                isSosActive = false,
                emergencyTelemetry = EmergencyTelemetry(isDispatched = false, sirenPlaying = false)
            )
        }
    }

    // Bhashini Translation Logic
    fun setLanguageFrom(lang: BhashiniLanguage) {
        _uiState.update { it.copy(selectedLanguageFrom = lang) }
    }

    fun setLanguageTo(lang: BhashiniLanguage) {
        _uiState.update { it.copy(selectedLanguageTo = lang) }
    }

    fun setTranslationInput(text: String) {
        _uiState.update { it.copy(translationInput = text) }
    }

    fun translateCurrentInput() {
        val input = _uiState.value.translationInput.trim()
        if (input.isEmpty()) return

        viewModelScope.launch {
            _uiState.update { it.copy(isTranslating = true) }
            delay(400) // Simulated fast Bhashini AI inference

            val targetLangCode = _uiState.value.selectedLanguageTo.code
            val (translated, phonetic) = generateBhashiniTranslation(input, targetLangCode)

            _uiState.update {
                it.copy(
                    translatedOutput = translated,
                    translationPhonetic = phonetic,
                    isTranslating = false
                )
            }
        }
    }

    fun applyQuickPhrase(phrase: QuickPhrase) {
        _uiState.update {
            it.copy(
                translationInput = phrase.englishText,
                translatedOutput = phrase.hindiText,
                translationPhonetic = phrase.pronunciation
            )
        }
    }

    private fun generateBhashiniTranslation(text: String, targetLang: String): Pair<String, String> {
        val lower = text.lowercase()
        return when {
            lower.contains("hello") || lower.contains("namaste") ->
                when (targetLang) {
                    "hi" -> Pair("नमस्ते, आप कैसे हैं?", "Namaste, aap kaise hain?")
                    "ta" -> Pair("வணக்கம், நீங்கள் எப்படி இருக்கிறீர்கள்?", "Vanakkam, neengal eppadi irukkeerargal?")
                    "te" -> Pair("నమస్కారం, మీరు ఎలా ఉన్నారు?", "Namaskaram, meeru ela unnaru?")
                    "bn" -> Pair("নমস্কার, আপনি কেমন আছেন?", "Nomoshkar, apni kemon aachen?")
                    "fr" -> Pair("Bonjour, comment allez-vous?", "Bon-zhoor")
                    else -> Pair("नमस्ते!", "Namaste!")
                }
            lower.contains("price") || lower.contains("cost") || lower.contains("how much") ->
                when (targetLang) {
                    "hi" -> Pair("इसकी सरकारी तय कीमत कितनी है?", "Iski sarkari tay keemat kitni hai?")
                    "ta" -> Pair("இதன் அதிகாரப்பூர்வ விலை என்ன?", "Idhan adhigaarappoorva vilai enna?")
                    "fr" -> Pair("Quel est le tarif officiel fixé?", "Kel ay luh tareef off-ee-see-el?")
                    else -> Pair("इसकी क्या कीमत है?", "Iski kya keemat hai?")
                }
            lower.contains("help") || lower.contains("police") || lower.contains("emergency") ->
                Pair("कृपया मेरी तुरंत मदद करें, यह एक आपात स्थिति है!", "Kripya meri turant madad karein, yeh ek aapaat sthiti hai!")
            lower.contains("safe") || lower.contains("route") ->
                Pair("क्या यह पर्यटन मार्ग पर्यटकों के लिए पूरी तरह सुरक्षित है?", "Kya yeh paryatan maarg paryatakon ke liye poori tarah surakshit hai?")
            else ->
                Pair(
                    "सुरक्षित यात्रा के लिए धन्यवाद: $text",
                    "Surakshit yatra ke liye dhanyavaad"
                )
        }
    }

    // AI Concierge Itinerary Planner
    fun setPlannerQuery(query: String) {
        _uiState.update { it.copy(aiPlannerQuery = query) }
    }

    fun generateAiItinerary() {
        val query = _uiState.value.aiPlannerQuery
        viewModelScope.launch {
            _uiState.update { it.copy(isGeneratingPlan = true) }
            delay(700)

            val generatedPlan = """
🌟 HyperTour AI Smart Itinerary (Anti-Crowd & 100% Verified Safe)

📍 Location: Agra Heritage Corridor
🛡️ Safety Level: HIGH (Geo-fenced Tourist Safe Corridor with ERSS 112 Patrol)
💰 Official Fixed Budget: ~₹1,450 (Zero Touting / Protected Tariffs)

⏰ 06:00 AM - 08:30 AM | Sunrise at Taj Mahal
• Advantage: Lowest crowd density (20% footfall), mild 22°C temperature.
• ASI Official Pass: ₹50 Entry Gate + ₹450 Authorized ASI Guide.
• Anti-Gouging Notice: Enter via East Gate to skip West Gate crowd surge.

⏰ 09:00 AM - 10:30 AM | Verified Heritage Breakfast
• UP Tourism Certified Café (Fixed Menu Rates, Bottled RO Water).

⏰ 11:00 AM - 01:00 PM | Agra Fort & Jahangiri Mahal
• Shaded courtyards protect from midday sun.
• Electric Govt Shuttle: ₹18 fixed per km.

⏰ 02:00 PM - 04:30 PM | Safe Craft Exploration (Zardozi & Marble Inlay)
• UP State Handicrafts Emporium (Govt Authenticated, fixed genuine pricing).

⏰ 05:30 PM - 06:30 PM | Sunset View at Mehtab Bagh
• Low-crowd riverside view across Yamuna River with tourist police presence.

💡 Pro Safety Tip: Keep your offline QR pass saved in the HyperTour wallet; it scans instantly even with zero cellular connectivity.
            """.trimIndent()

            _uiState.update {
                it.copy(
                    aiPlannerResponse = generatedPlan,
                    isGeneratingPlan = false
                )
            }
        }
    }

    // Provider Functions
    fun simulateScanTicket() {
        viewModelScope.launch {
            _uiState.update { it.copy(scannedCheckInResult = "Scanning QR Code...") }
            delay(500)
            _uiState.update {
                it.copy(
                    scannedCheckInResult = "✅ Valid ASI Pass #PASS-HT-7739 Verified! Tourist Alex Morgan checked in safely. Official tariff locked.",
                    providerEarningsToday = it.providerEarningsToday + 450.0,
                    providerTripsCompleted = it.providerTripsCompleted + 1
                )
            }
        }
    }

    fun dismissScanResult() {
        _uiState.update { it.copy(scannedCheckInResult = null) }
    }
}
