package com.example.data

import com.example.model.*

object SampleTourismData {

    val sampleAttractions = listOf(
        AttractionItem(
            id = "att_taj_mahal",
            name = "Taj Mahal Heritage Complex",
            city = "Agra",
            state = "Uttar Pradesh",
            officialPriceInr = 50.0,
            timeSlot = "06:00 AM - 06:30 PM",
            crowdLevel = CrowdLevel.LOW,
            safetyScore = 4.9,
            safeHours = "06:00 AM - 09:30 AM (Lowest Crowds & Heat)",
            description = "UNESCO World Heritage site with ASI digital e-gate entry, active tourist police post, and fixed government ticketing.",
            asiCode = "ASI-UP-AGR-001"
        ),
        AttractionItem(
            id = "att_qutub_minar",
            name = "Qutub Minar & Mehrauli Complex",
            city = "New Delhi",
            state = "Delhi NCR",
            officialPriceInr = 40.0,
            timeSlot = "07:00 AM - 05:00 PM",
            crowdLevel = CrowdLevel.MODERATE,
            safetyScore = 4.8,
            safeHours = "08:00 AM - 11:00 AM",
            description = "Ancient 73m high victory tower surrounded by lush green lawns with smart audio guide integration.",
            asiCode = "ASI-DL-NDL-004"
        ),
        AttractionItem(
            id = "att_hawa_mahal",
            name = "Hawa Mahal (Palace of Winds)",
            city = "Jaipur",
            state = "Rajasthan",
            officialPriceInr = 50.0,
            timeSlot = "09:00 AM - 05:00 PM",
            crowdLevel = CrowdLevel.HIGH,
            safetyScore = 4.7,
            safeHours = "09:00 AM - 10:30 AM",
            description = "Iconic five-story pink sandstone structure with 953 jharokhas in the heart of Jaipur walled city.",
            asiCode = "ASI-RJ-JPR-009"
        ),
        AttractionItem(
            id = "att_kashi_ghats",
            name = "Dashashwamedh & Heritage Ghats",
            city = "Varanasi",
            state = "Uttar Pradesh",
            officialPriceInr = 0.0,
            timeSlot = "Open 24 Hours",
            crowdLevel = CrowdLevel.HIGH,
            safetyScore = 4.6,
            safeHours = "05:30 AM - 08:00 AM (Morning Aarti)",
            description = "Holy river ghats with dedicated tourist safety corridors, NDRF river patrol, and live CCTV geo-fencing.",
            asiCode = "ASI-UP-VNS-012"
        ),
        AttractionItem(
            id = "att_amber_fort",
            name = "Amber Palace & Jaigarh Corridor",
            city = "Jaipur",
            state = "Rajasthan",
            officialPriceInr = 100.0,
            timeSlot = "08:00 AM - 05:30 PM",
            crowdLevel = CrowdLevel.MODERATE,
            safetyScore = 4.8,
            safeHours = "08:00 AM - 11:00 AM",
            description = "Majestic hilltop fort overlooking Maota Lake with authorized battery e-cart transport up the hill.",
            asiCode = "ASI-RJ-JPR-002"
        )
    )

    val sampleGuides = listOf(
        VerifiedGuide(
            id = "guide_1",
            name = "Rajesh Sharma",
            badgeNumber = "ASI-LIC-UP-8842",
            blockchainNftHash = "0x7F9a...84B2 (NITI Aayog Chain)",
            city = "Agra",
            languages = listOf("English", "Hindi", "French", "German"),
            experienceYears = 12,
            rating = 4.95,
            reviewsCount = 428,
            ratePerHourInr = 450.0,
            specialization = "Mughal Architecture & Agra Fort History",
            isAvailable = true,
            phone = "+91 98370 12345"
        ),
        VerifiedGuide(
            id = "guide_2",
            name = "Sunita Rao",
            badgeNumber = "ASI-LIC-RJ-5120",
            blockchainNftHash = "0x3C4b...91E0 (NITI Aayog Chain)",
            city = "Jaipur",
            languages = listOf("English", "Hindi", "Spanish", "Japanese"),
            experienceYears = 8,
            rating = 4.9,
            reviewsCount = 312,
            ratePerHourInr = 400.0,
            specialization = "Rajput Heritage, Gemology & City Palace",
            isAvailable = true,
            phone = "+91 94140 87654"
        ),
        VerifiedGuide(
            id = "guide_3",
            name = "Amitabh Sen",
            badgeNumber = "ASI-LIC-DL-7731",
            blockchainNftHash = "0x8E1d...33A7 (NITI Aayog Chain)",
            city = "Delhi",
            languages = listOf("English", "Hindi", "Bengali", "Italian"),
            experienceYears = 15,
            rating = 4.98,
            reviewsCount = 590,
            ratePerHourInr = 500.0,
            specialization = "Sultanate, Mughal & Lutyens Delhi",
            isAvailable = true,
            phone = "+91 98110 56789"
        )
    )

    val sampleTransits = listOf(
        TransitOption(
            id = "trans_1",
            type = "Pre-paid Electric Taxi",
            provider = "Govt Tourism Green Fleets",
            officialRatePerKmOrPass = 18.0,
            routeDescription = "Agra Cantt Railway Station ⇆ Taj Mahal & Fort Corridor",
            safetyRating = 4.9,
            isGpsTracked = true,
            driverName = "Manoj Verma (Verified)",
            vehicleNumber = "UP 80 EV 4912",
            fixedFareGuarantee = true
        ),
        TransitOption(
            id = "trans_2",
            type = "Verified Smart Auto",
            provider = "Jaipur Smart City Mobility",
            officialRatePerKmOrPass = 12.0,
            routeDescription = "Hawa Mahal ⇆ Amber Palace ⇆ City Palace",
            safetyRating = 4.8,
            isGpsTracked = true,
            driverName = "Kishan Lal (Badge #JPR-489)",
            vehicleNumber = "RJ 14 TA 8831",
            fixedFareGuarantee = true
        ),
        TransitOption(
            id = "trans_3",
            type = "Delhi Tourist Metro 1-Day Pass",
            provider = "DMRC & Delhi Tourism Board",
            officialRatePerKmOrPass = 150.0,
            routeDescription = "Unlimited Access to 280+ Stations & Monument Links",
            safetyRating = 5.0,
            isGpsTracked = true,
            driverName = "Automated Transit Network",
            vehicleNumber = "DMRC Network Rail",
            fixedFareGuarantee = true
        )
    )

    val sampleStays = listOf(
        StayOption(
            id = "stay_1",
            name = "Taj Khema Heritage Retreat",
            type = "UP State Tourism Corporation Hotel",
            city = "Agra",
            pricePerNightInr = 2800.0,
            safetyRating = 4.9,
            govtCertifiedBadge = "UPSTDC 5-Star Safety Audit",
            amenities = listOf("Taj View Gardens", "24/7 Security", "Verified Taxi Desk", "Doctor on Call")
        ),
        StayOption(
            id = "stay_2",
            name = "RTDC Hotel Gangaur",
            type = "Rajasthan Tourism State Stay",
            city = "Jaipur",
            pricePerNightInr = 2200.0,
            safetyRating = 4.8,
            govtCertifiedBadge = "RTDC Govt Authenticated",
            amenities = listOf("Heritage Dining", "Women Solo Safe", "Free Guide Assist", "CCTV Protected")
        ),
        StayOption(
            id = "stay_3",
            name = "Varanasi Heritage Ghat Bhavan",
            type = "Tourism Board Verified Homestay",
            city = "Varanasi",
            pricePerNightInr = 1600.0,
            safetyRating = 4.85,
            govtCertifiedBadge = "NDTM Verified Host #VNS-921",
            amenities = listOf("Ghat Proximity", "Clean Filtered RO Water", "Local Cultural Host", "Safe Locker")
        )
    )

    val sampleSafetyAlerts = listOf(
        SafetyAlert(
            id = "alert_1",
            title = "High Footfall Alert at Taj Mahal West Gate",
            location = "Taj Mahal West Gate, Agra",
            message = "Crowd surge detected (approx. 4,200 visitors/hr). Entry queues may exceed 45 mins.",
            safeAlternate = "Enter via Taj Mahal East Gate or visit nearby Mehtab Bagh for calm view.",
            safeTimeSlot = "Recommended entry: 06:00 AM - 08:30 AM",
            severity = AlertSeverity.WARNING,
            timeAgo = "12 mins ago"
        ),
        SafetyAlert(
            id = "alert_2",
            title = "Safe Heritage Zone Active",
            location = "Agra Heritage Corridor (Taj & Fort)",
            message = "Patrolled by UP Tourist Police & ERSS 112 Mobile Patrol. Zero-tolerance anti-touting zone.",
            safeAlternate = "Report unauthorized touts via 1-tap SOS in app.",
            safeTimeSlot = "Safe all operational hours",
            severity = AlertSeverity.INFO,
            timeAgo = "Just now"
        ),
        SafetyAlert(
            id = "alert_3",
            title = "Afternoon Heat & Sun Warning",
            location = "Jaipur Amber Fort Open Courtyards",
            message = "Temperatures reaching 38°C with high UV index in midday sun.",
            safeAlternate = "Visit indoor Anokhi Museum or enjoy City Palace shaded galleries.",
            safeTimeSlot = "Safest visiting hours: 08:00 AM - 10:30 AM",
            severity = AlertSeverity.INFO,
            timeAgo = "1 hour ago"
        )
    )

    val supportedLanguages = listOf(
        BhashiniLanguage("en", "English", "English"),
        BhashiniLanguage("hi", "Hindi", "हिन्दी"),
        BhashiniLanguage("ta", "Tamil", "தமிழ்"),
        BhashiniLanguage("te", "Telugu", "తెలుగు"),
        BhashiniLanguage("bn", "Bengali", "বাংলা"),
        BhashiniLanguage("mr", "Marathi", "मराठी"),
        BhashiniLanguage("gu", "Gujarati", "ગુજરાતી"),
        BhashiniLanguage("fr", "French", "Français"),
        BhashiniLanguage("es", "Spanish", "Español")
    )

    val sampleQuickPhrases = listOf(
        QuickPhrase(
            category = "Emergency",
            englishText = "Please help me, call the police!",
            hindiText = "कृपया मेरी मदद करें, पुलिस को बुलाएं!",
            pronunciation = "Kripya meri madad karein, police ko bulayein!"
        ),
        QuickPhrase(
            category = "Emergency",
            englishText = "Where is the nearest hospital or pharmacy?",
            hindiText = "निकटतम अस्पताल या दवा की दुकान कहाँ है?",
            pronunciation = "Nikat-tam aspatal ya dawa ki dukaan kahan hai?"
        ),
        QuickPhrase(
            category = "Transport",
            englishText = "Please take me to Taj Mahal East Gate at official meter rate.",
            hindiText = "कृपया मुझे आधिकारिक मीटर दर पर ताज महल पूर्वी गेट ले चलें।",
            pronunciation = "Kripya mujhe aadhikaarik meter dar par Taj Mahal poorvi gate le chalein."
        ),
        QuickPhrase(
            category = "Shopping / Price",
            englishText = "What is the official fixed government price for this item?",
            hindiText = "इस वस्तु की आधिकारिक सरकारी तय कीमत क्या है?",
            pronunciation = "Is vastu ki aadhikaarik sarkari tay keemat kya hai?"
        ),
        QuickPhrase(
            category = "Directions",
            englishText = "Is this route safe to walk after sunset?",
            hindiText = "क्या सूर्यास्त के बाद इस रास्ते पर पैदल चलना सुरक्षित है?",
            pronunciation = "Kya sooryast ke baad is raaste par paidal chalna surakshit hai?"
        )
    )

    val defaultPasses = listOf(
        BookingPass(
            id = "PASS-ASI-7739",
            title = "Taj Mahal Monument E-Pass",
            category = "ASI Heritage Entry",
            details = "Valid for 1 Adult • East Gate E-Turnstile",
            amountPaidInr = 50.0,
            qrCodeData = "ASI-AGRA-TAJ-7739-VAL-2026-OK",
            verificationHash = "0x9E21...4FA8",
            date = "Today",
            timeSlot = "06:00 AM - 10:00 AM",
            touristName = "Alex Morgan",
            status = "CONFIRMED & ACTIVE"
        )
    )
}
