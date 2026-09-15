package com.example.ui.screens

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.SampleTourismData
import com.example.model.AuthTab
import com.example.model.BhashiniLanguage
import com.example.model.ProviderType
import com.example.ui.theme.*
import com.example.viewmodel.HyperTourUiState
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

enum class LoginMethod {
    PHONE_OTP,
    EMAIL_PASSWORD,
    DIGILOCKER
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(
    uiState: HyperTourUiState,
    onLoginTourist: (name: String, contact: String, emergencyContact: String) -> Unit,
    onLoginProvider: (name: String, badgeOrPhone: String, type: ProviderType) -> Unit,
    onDemoTouristClick: () -> Unit,
    onDemoProviderClick: () -> Unit,
    onSelectLanguage: (BhashiniLanguage) -> Unit,
    modifier: Modifier = Modifier
) {
    var selectedAuthTab by remember { mutableStateOf(AuthTab.TOURIST) }
    var loginMethod by remember { mutableStateOf(LoginMethod.PHONE_OTP) }

    // Form inputs
    var nameInput by remember { mutableStateOf("") }
    var phoneInput by remember { mutableStateOf("") }
    var emailInput by remember { mutableStateOf("") }
    var passwordInput by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    var emergencyContactInput by remember { mutableStateOf("+91 98765 43210") }
    var badgeNumberInput by remember { mutableStateOf("") }
    var selectedProviderType by remember { mutableStateOf(ProviderType.LOCAL_GUIDE) }

    // OTP state
    var otpSent by remember { mutableStateOf(false) }
    var otpCodeInput by remember { mutableStateOf("") }
    var otpResendCountdown by remember { mutableIntStateOf(30) }
    var isOtpTimerRunning by remember { mutableStateOf(false) }

    // Language dropdown menu state
    var isLanguageMenuExpanded by remember { mutableStateOf(false) }

    // Validation & loading states
    var formError by remember { mutableStateOf<String?>(null) }
    var isProcessing by remember { mutableStateOf(false) }

    val coroutineScope = rememberCoroutineScope()
    val focusManager = LocalFocusManager.current
    val scrollState = rememberScrollState()

    // Countdown effect for OTP resend
    LaunchedEffect(isOtpTimerRunning, otpResendCountdown) {
        if (isOtpTimerRunning && otpResendCountdown > 0) {
            delay(1000)
            otpResendCountdown -= 1
        } else if (otpResendCountdown == 0) {
            isOtpTimerRunning = false
        }
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(
                        NavySecondary,
                        Color(0xFF1E293B),
                        BackgroundLight
                    ),
                    startY = 0f,
                    endY = 600f
                )
            )
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .verticalScroll(scrollState)
                .padding(horizontal = 20.dp, vertical = 16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Top Bar with Language Selector
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    color = Color.White.copy(alpha = 0.12f),
                    shape = RoundedCornerShape(20.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color.White.copy(alpha = 0.2f))
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(6.dp)
                                .clip(CircleShape)
                                .background(EmeraldLight)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "SIH 2026 • MoT Verified",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color.White
                        )
                    }
                }

                // Multilingual Selector Dropdown
                Box {
                    Surface(
                        color = Color.White.copy(alpha = 0.15f),
                        shape = RoundedCornerShape(20.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Color.White.copy(alpha = 0.25f)),
                        modifier = Modifier.clickable { isLanguageMenuExpanded = true }
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.Translate,
                                contentDescription = "Select Language",
                                tint = Color.White,
                                modifier = Modifier.size(14.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "${uiState.selectedLanguageFrom.displayName} (${uiState.selectedLanguageFrom.nativeName})",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Medium,
                                color = Color.White
                            )
                            Spacer(modifier = Modifier.width(2.dp))
                            Icon(
                                imageVector = Icons.Default.ArrowDropDown,
                                contentDescription = null,
                                tint = Color.White,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }

                    DropdownMenu(
                        expanded = isLanguageMenuExpanded,
                        onDismissRequest = { isLanguageMenuExpanded = false }
                    ) {
                        SampleTourismData.supportedLanguages.forEach { lang ->
                            DropdownMenuItem(
                                text = {
                                    Text(
                                        text = "${lang.displayName} - ${lang.nativeName}",
                                        fontWeight = if (lang == uiState.selectedLanguageFrom) FontWeight.Bold else FontWeight.Normal
                                    )
                                },
                                onClick = {
                                    onSelectLanguage(lang)
                                    isLanguageMenuExpanded = false
                                },
                                leadingIcon = {
                                    if (lang == uiState.selectedLanguageFrom) {
                                        Icon(
                                            Icons.Default.Check,
                                            contentDescription = null,
                                            tint = SaffronPrimary,
                                            modifier = Modifier.size(18.dp)
                                        )
                                    }
                                }
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // App Brand Hero Header
            Box(
                modifier = Modifier
                    .size(72.dp)
                    .clip(RoundedCornerShape(20.dp))
                    .background(
                        Brush.linearGradient(
                            listOf(SaffronPrimary, SaffronLight)
                        )
                    ),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.TravelExplore,
                    contentDescription = "HyperTour Logo",
                    tint = Color.White,
                    modifier = Modifier.size(44.dp)
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            Text(
                text = "HyperTour AI",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.ExtraBold,
                color = Color.White,
                letterSpacing = 0.5.sp
            )

            Text(
                text = "Smart Tourist Safety & Verified Fare Hub",
                style = MaterialTheme.typography.bodyMedium,
                color = Color.White.copy(alpha = 0.8f),
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Persona Selector Tabs (Tourist vs Provider)
            Surface(
                color = Color.White,
                shape = RoundedCornerShape(16.dp),
                shadowElevation = 6.dp,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    // Segmented Tabs
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color(0xFFF1F5F9))
                            .padding(4.dp)
                    ) {
                        AuthTab.values().forEach { tab ->
                            val isSelected = selectedAuthTab == tab
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(if (isSelected) (if (tab == AuthTab.TOURIST) SaffronPrimary else NavySecondary) else Color.Transparent)
                                    .clickable {
                                        selectedAuthTab = tab
                                        formError = null
                                    }
                                    .padding(vertical = 10.dp)
                                    .testTag("auth_tab_${tab.name}"),
                                contentAlignment = Alignment.Center
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(
                                        imageVector = if (tab == AuthTab.TOURIST) Icons.Default.Person else Icons.Default.VerifiedUser,
                                        contentDescription = null,
                                        tint = if (isSelected) Color.White else Color(0xFF64748B),
                                        modifier = Modifier.size(16.dp)
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(
                                        text = tab.label,
                                        fontSize = 13.sp,
                                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                        color = if (isSelected) Color.White else Color(0xFF64748B)
                                    )
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Login Method Toggle (OTP vs Email/Password vs DigiLocker)
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.Center
                    ) {
                        FilterChip(
                            selected = loginMethod == LoginMethod.PHONE_OTP,
                            onClick = {
                                loginMethod = LoginMethod.PHONE_OTP
                                formError = null
                            },
                            label = { Text("Mobile OTP", fontSize = 12.sp) },
                            leadingIcon = {
                                Icon(Icons.Default.PhoneAndroid, contentDescription = null, modifier = Modifier.size(14.dp))
                            },
                            modifier = Modifier.padding(end = 6.dp)
                        )
                        FilterChip(
                            selected = loginMethod == LoginMethod.EMAIL_PASSWORD,
                            onClick = {
                                loginMethod = LoginMethod.EMAIL_PASSWORD
                                formError = null
                            },
                            label = { Text("Email / Pass", fontSize = 12.sp) },
                            leadingIcon = {
                                Icon(Icons.Default.Email, contentDescription = null, modifier = Modifier.size(14.dp))
                            },
                            modifier = Modifier.padding(end = 6.dp)
                        )
                        FilterChip(
                            selected = loginMethod == LoginMethod.DIGILOCKER,
                            onClick = {
                                loginMethod = LoginMethod.DIGILOCKER
                                formError = null
                            },
                            label = { Text("DigiLocker", fontSize = 12.sp) },
                            leadingIcon = {
                                Icon(Icons.Default.Shield, contentDescription = null, modifier = Modifier.size(14.dp))
                            }
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Dynamic Forms based on Mode & Method
                    if (selectedAuthTab == AuthTab.TOURIST) {
                        // TOURIST LOGIN FORM
                        when (loginMethod) {
                            LoginMethod.PHONE_OTP -> {
                                OutlinedTextField(
                                    value = nameInput,
                                    onValueChange = { nameInput = it },
                                    label = { Text("Full Name (Optional)") },
                                    placeholder = { Text("e.g. Alex Morgan") },
                                    leadingIcon = { Icon(Icons.Outlined.Person, contentDescription = null) },
                                    singleLine = true,
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .testTag("tourist_name_input")
                                )

                                Spacer(modifier = Modifier.height(10.dp))

                                OutlinedTextField(
                                    value = phoneInput,
                                    onValueChange = {
                                        if (it.length <= 10 && it.all { char -> char.isDigit() }) {
                                            phoneInput = it
                                        }
                                    },
                                    label = { Text("Mobile Number") },
                                    placeholder = { Text("9876543210") },
                                    leadingIcon = {
                                        Row(
                                            verticalAlignment = Alignment.CenterVertically,
                                            modifier = Modifier.padding(start = 12.dp, end = 4.dp)
                                        ) {
                                            Text(
                                                text = "🇮🇳 +91",
                                                fontWeight = FontWeight.Bold,
                                                fontSize = 14.sp
                                            )
                                        }
                                    },
                                    trailingIcon = {
                                        if (phoneInput.length == 10 && !otpSent) {
                                            TextButton(
                                                onClick = {
                                                    otpSent = true
                                                    otpCodeInput = "773901"
                                                    isOtpTimerRunning = true
                                                    otpResendCountdown = 30
                                                }
                                            ) {
                                                Text("Get OTP", fontWeight = FontWeight.Bold, color = SaffronPrimary)
                                            }
                                        }
                                    },
                                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone, imeAction = ImeAction.Next),
                                    singleLine = true,
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .testTag("tourist_phone_input")
                                )

                                if (otpSent) {
                                    Spacer(modifier = Modifier.height(10.dp))

                                    Surface(
                                        color = EmeraldSuccess.copy(alpha = 0.08f),
                                        shape = RoundedCornerShape(8.dp),
                                        border = androidx.compose.foundation.BorderStroke(1.dp, EmeraldSuccess.copy(alpha = 0.3f)),
                                        modifier = Modifier.fillMaxWidth()
                                    ) {
                                        Row(
                                            modifier = Modifier.padding(10.dp),
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Icon(
                                                Icons.Default.Sms,
                                                contentDescription = null,
                                                tint = EmeraldSuccess,
                                                modifier = Modifier.size(16.dp)
                                            )
                                            Spacer(modifier = Modifier.width(8.dp))
                                            Text(
                                                text = "OTP sent to +91 $phoneInput (Auto-filled: 773901)",
                                                fontSize = 12.sp,
                                                color = EmeraldSuccess,
                                                fontWeight = FontWeight.Medium
                                            )
                                        }
                                    }

                                    Spacer(modifier = Modifier.height(10.dp))

                                    OutlinedTextField(
                                        value = otpCodeInput,
                                        onValueChange = {
                                            if (it.length <= 6 && it.all { char -> char.isDigit() }) {
                                                otpCodeInput = it
                                            }
                                        },
                                        label = { Text("6-Digit OTP Code") },
                                        placeholder = { Text("773901") },
                                        leadingIcon = { Icon(Icons.Outlined.Lock, contentDescription = null) },
                                        trailingIcon = {
                                            if (isOtpTimerRunning) {
                                                Text(
                                                    text = "${otpResendCountdown}s",
                                                    fontSize = 12.sp,
                                                    color = Color.Gray,
                                                    modifier = Modifier.padding(end = 12.dp)
                                                )
                                            } else {
                                                TextButton(
                                                    onClick = {
                                                        otpResendCountdown = 30
                                                        isOtpTimerRunning = true
                                                    }
                                                ) {
                                                    Text("Resend", fontSize = 12.sp)
                                                }
                                            }
                                        },
                                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number, imeAction = ImeAction.Done),
                                        singleLine = true,
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .testTag("tourist_otp_input")
                                    )
                                }

                                Spacer(modifier = Modifier.height(10.dp))

                                OutlinedTextField(
                                    value = emergencyContactInput,
                                    onValueChange = { emergencyContactInput = it },
                                    label = { Text("Emergency Contact (ERSS 112 / Kin)") },
                                    leadingIcon = { Icon(Icons.Outlined.Sos, contentDescription = null, tint = SOSRed) },
                                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                                    singleLine = true,
                                    modifier = Modifier.fillMaxWidth()
                                )
                            }
                            LoginMethod.EMAIL_PASSWORD -> {
                                OutlinedTextField(
                                    value = emailInput,
                                    onValueChange = { emailInput = it },
                                    label = { Text("Email Address") },
                                    placeholder = { Text("alex.morgan@tourist.org") },
                                    leadingIcon = { Icon(Icons.Outlined.Email, contentDescription = null) },
                                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email, imeAction = ImeAction.Next),
                                    singleLine = true,
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .testTag("tourist_email_input")
                                )

                                Spacer(modifier = Modifier.height(10.dp))

                                OutlinedTextField(
                                    value = passwordInput,
                                    onValueChange = { passwordInput = it },
                                    label = { Text("Password") },
                                    leadingIcon = { Icon(Icons.Outlined.Lock, contentDescription = null) },
                                    trailingIcon = {
                                        IconButton(onClick = { passwordVisible = !passwordVisible }) {
                                            Icon(
                                                imageVector = if (passwordVisible) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                                                contentDescription = if (passwordVisible) "Hide password" else "Show password"
                                            )
                                        }
                                    },
                                    visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password, imeAction = ImeAction.Done),
                                    singleLine = true,
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .testTag("tourist_password_input")
                                )
                            }
                            LoginMethod.DIGILOCKER -> {
                                Surface(
                                    color = Color(0xFFEFF6FF),
                                    shape = RoundedCornerShape(12.dp),
                                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF93C5FD)),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Column(
                                        modifier = Modifier.padding(16.dp),
                                        horizontalAlignment = Alignment.CenterHorizontally
                                    ) {
                                        Icon(
                                            Icons.Default.VerifiedUser,
                                            contentDescription = null,
                                            tint = CyanAccent,
                                            modifier = Modifier.size(36.dp)
                                        )
                                        Spacer(modifier = Modifier.height(8.dp))
                                        Text(
                                            text = "Government DigiLocker Authentication",
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 14.sp,
                                            color = NavySecondary
                                        )
                                        Spacer(modifier = Modifier.height(4.dp))
                                        Text(
                                            text = "Instantly verify Aadhaar / Passport for rapid ASI Monument e-Gate access & tourist police registration.",
                                            fontSize = 12.sp,
                                            color = Color(0xFF475569),
                                            textAlign = TextAlign.Center
                                        )
                                    }
                                }
                            }
                        }
                    } else {
                        // SERVICE PROVIDER LOGIN FORM
                        Text(
                            text = "Select Provider Category:",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(modifier = Modifier.height(6.dp))

                        Row(modifier = Modifier.fillMaxWidth()) {
                            ProviderType.values().forEach { type ->
                                val isTypeSelected = selectedProviderType == type
                                Surface(
                                    shape = RoundedCornerShape(8.dp),
                                    color = if (isTypeSelected) NavySecondary else Color(0xFFF1F5F9),
                                    modifier = Modifier
                                        .weight(1f)
                                        .padding(horizontal = 2.dp)
                                        .clickable { selectedProviderType = type }
                                ) {
                                    Column(
                                        modifier = Modifier.padding(vertical = 8.dp),
                                        horizontalAlignment = Alignment.CenterHorizontally
                                    ) {
                                        Icon(
                                            imageVector = when (type) {
                                                ProviderType.LOCAL_GUIDE -> Icons.Default.Badge
                                                ProviderType.CAB_DRIVER -> Icons.Default.DirectionsCar
                                                ProviderType.HOTEL_OWNER -> Icons.Default.Hotel
                                            },
                                            contentDescription = null,
                                            tint = if (isTypeSelected) Color.White else Color(0xFF475569),
                                            modifier = Modifier.size(18.dp)
                                        )
                                        Spacer(modifier = Modifier.height(4.dp))
                                        Text(
                                            text = when (type) {
                                                ProviderType.LOCAL_GUIDE -> "ASI Guide"
                                                ProviderType.CAB_DRIVER -> "Cab Driver"
                                                ProviderType.HOTEL_OWNER -> "Stay Host"
                                            },
                                            fontSize = 10.sp,
                                            fontWeight = if (isTypeSelected) FontWeight.Bold else FontWeight.Normal,
                                            color = if (isTypeSelected) Color.White else Color(0xFF475569)
                                        )
                                    }
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        OutlinedTextField(
                            value = nameInput,
                            onValueChange = { nameInput = it },
                            label = { Text("Provider / Operator Name") },
                            placeholder = { Text("e.g. Rajesh Sharma") },
                            leadingIcon = { Icon(Icons.Outlined.Person, contentDescription = null) },
                            singleLine = true,
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("provider_name_input")
                        )

                        Spacer(modifier = Modifier.height(10.dp))

                        OutlinedTextField(
                            value = badgeNumberInput,
                            onValueChange = { badgeNumberInput = it },
                            label = { Text("Official ASI / RTO License Badge ID") },
                            placeholder = { Text("ASI-LIC-UP-8842") },
                            leadingIcon = { Icon(Icons.Outlined.Badge, contentDescription = null, tint = CyanAccent) },
                            singleLine = true,
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("provider_badge_input")
                        )

                        Spacer(modifier = Modifier.height(10.dp))

                        Surface(
                            color = EmeraldSuccess.copy(alpha = 0.08f),
                            shape = RoundedCornerShape(8.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, EmeraldSuccess.copy(alpha = 0.3f)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier.padding(10.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    Icons.Default.Verified,
                                    contentDescription = null,
                                    tint = EmeraldSuccess,
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "NITI Aayog & ASI Blockchain Verified Partner Portal",
                                    fontSize = 11.sp,
                                    color = EmeraldSuccess,
                                    fontWeight = FontWeight.Medium
                                )
                            }
                        }
                    }

                    if (formError != null) {
                        Spacer(modifier = Modifier.height(10.dp))
                        Surface(
                            color = SOSRed.copy(alpha = 0.1f),
                            shape = RoundedCornerShape(8.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, SOSRed.copy(alpha = 0.3f)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier.padding(10.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    Icons.Default.ErrorOutline,
                                    contentDescription = null,
                                    tint = SOSRed,
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = formError!!,
                                    fontSize = 12.sp,
                                    color = SOSRed,
                                    fontWeight = FontWeight.Medium
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Primary Submit Button
                    Button(
                        onClick = {
                            focusManager.clearFocus()
                            isProcessing = true
                            coroutineScope.launch {
                                delay(350) // smooth feel
                                isProcessing = false
                                if (selectedAuthTab == AuthTab.TOURIST) {
                                    val touristName = nameInput.ifBlank { "Alex Morgan" }
                                    val contact = when (loginMethod) {
                                        LoginMethod.PHONE_OTP -> if (phoneInput.isNotBlank()) "+91 $phoneInput" else "+91 98765 43210"
                                        LoginMethod.EMAIL_PASSWORD -> if (emailInput.isNotBlank()) emailInput else "alex.morgan@tourist.org"
                                        LoginMethod.DIGILOCKER -> "DigiLocker-ID-IN-7739"
                                    }
                                    onLoginTourist(touristName, contact, emergencyContactInput)
                                } else {
                                    val provName = nameInput.ifBlank { "Rajesh Sharma" }
                                    val badge = badgeNumberInput.ifBlank { "ASI-LIC-UP-8842" }
                                    onLoginProvider(provName, badge, selectedProviderType)
                                }
                            }
                        },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (selectedAuthTab == AuthTab.TOURIST) SaffronPrimary else NavySecondary
                        ),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp)
                            .testTag("submit_login_button")
                    ) {
                        if (isProcessing) {
                            CircularProgressIndicator(
                                color = Color.White,
                                modifier = Modifier.size(20.dp),
                                strokeWidth = 2.dp
                            )
                        } else {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = if (selectedAuthTab == AuthTab.TOURIST) "Sign In as Tourist" else "Sign In as Verified Provider",
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Bold
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Icon(Icons.Default.ArrowForward, contentDescription = null, modifier = Modifier.size(18.dp))
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Quick 1-Tap Demo Access Section (For Judges & Evaluators)
            Surface(
                color = Color.White.copy(alpha = 0.95f),
                shape = RoundedCornerShape(16.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, CardBorder),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                Icons.Default.Bolt,
                                contentDescription = null,
                                tint = SaffronPrimary,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "1-Tap Quick Demo Logins",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = NavySecondary
                            )
                        }
                        Surface(
                            color = SaffronPrimary.copy(alpha = 0.15f),
                            shape = RoundedCornerShape(4.dp)
                        ) {
                            Text(
                                text = "Instant Evaluation",
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Bold,
                                color = SaffronPrimary,
                                modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Row(modifier = Modifier.fillMaxWidth()) {
                        OutlinedButton(
                            onClick = onDemoTouristClick,
                            shape = RoundedCornerShape(10.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, SaffronPrimary),
                            modifier = Modifier
                                .weight(1f)
                                .padding(end = 4.dp)
                                .testTag("quick_demo_tourist_button")
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text(
                                    text = "👤 Tourist Demo",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = SaffronPrimary
                                )
                                Text(
                                    text = "Alex Morgan",
                                    fontSize = 10.sp,
                                    color = Color.Gray
                                )
                            }
                        }

                        OutlinedButton(
                            onClick = onDemoProviderClick,
                            shape = RoundedCornerShape(10.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, CyanAccent),
                            modifier = Modifier
                                .weight(1f)
                                .padding(start = 4.dp)
                                .testTag("quick_demo_provider_button")
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text(
                                    text = "🛡️ Provider Demo",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = CyanAccent
                                )
                                Text(
                                    text = "ASI Guide Rajesh",
                                    fontSize = 10.sp,
                                    color = Color.Gray
                                )
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Trust & Security Footer Badges
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    Icons.Default.Security,
                    contentDescription = null,
                    tint = Color.White.copy(alpha = 0.7f),
                    modifier = Modifier.size(14.dp)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = "Anti-Gouging Protected • 112 SOS Geo-Fenced • End-to-End Encrypted",
                    fontSize = 10.sp,
                    color = Color.White.copy(alpha = 0.75f),
                    textAlign = TextAlign.Center
                )
            }

            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}
