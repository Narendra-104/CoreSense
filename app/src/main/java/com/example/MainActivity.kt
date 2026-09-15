package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.animation.*
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.model.AppMode
import com.example.ui.components.BookingConfirmationDialog
import com.example.ui.components.TopAppBarWithStatus
import com.example.ui.screens.*
import com.example.ui.theme.MyApplicationTheme
import com.example.ui.theme.NavySecondary
import com.example.ui.theme.SaffronPrimary
import com.example.viewmodel.HyperTourViewModel
import com.example.viewmodel.TouristTab

class MainActivity : ComponentActivity() {
    private val viewModel: HyperTourViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MyApplicationTheme {
                val uiState by viewModel.uiState.collectAsStateWithLifecycle()
                val snackbarHostState = remember { SnackbarHostState() }

                LaunchedEffect(uiState.bookingSuccessMessage) {
                    uiState.bookingSuccessMessage?.let { msg ->
                        snackbarHostState.showSnackbar(msg)
                        viewModel.dismissSuccessMessage()
                    }
                }

                if (!uiState.isAuthenticated) {
                    LoginScreen(
                        uiState = uiState,
                        onLoginTourist = { name, contact, emergencyContact ->
                            viewModel.loginTourist(name, contact, emergencyContact)
                        },
                        onLoginProvider = { name, badgeOrPhone, type ->
                            viewModel.loginProvider(name, badgeOrPhone, type)
                        },
                        onDemoTouristClick = {
                            viewModel.loginDemoTourist()
                        },
                        onDemoProviderClick = {
                            viewModel.loginDemoProvider()
                        },
                        onSelectLanguage = { lang ->
                            viewModel.setLanguageFrom(lang)
                        }
                    )
                } else {
                    Scaffold(
                        modifier = Modifier.fillMaxSize(),
                        topBar = {
                            TopAppBarWithStatus(
                                appMode = uiState.appMode,
                                onToggleMode = { newMode -> viewModel.setAppMode(newMode) },
                                onQuickSosClick = {
                                    viewModel.setAppMode(AppMode.TOURIST)
                                    viewModel.setTouristTab(TouristTab.SAFETY_RADAR)
                                },
                                userProfile = uiState.currentUser,
                                onLogout = { viewModel.logout() }
                            )
                        },
                    bottomBar = {
                        if (uiState.appMode == AppMode.TOURIST) {
                            NavigationBar(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .testTag("bottom_navigation_bar"),
                                containerColor = MaterialTheme.colorScheme.surface,
                                tonalElevation = 3.dp
                            ) {
                                TouristTab.values().forEach { tab ->
                                    val isSelected = uiState.currentTouristTab == tab
                                    NavigationBarItem(
                                        selected = isSelected,
                                        onClick = { viewModel.setTouristTab(tab) },
                                        icon = {
                                            Icon(
                                                imageVector = when (tab) {
                                                    TouristTab.EXPLORE -> if (isSelected) Icons.Filled.Explore else Icons.Outlined.Explore
                                                    TouristTab.SAFETY_RADAR -> if (isSelected) Icons.Filled.Shield else Icons.Outlined.Shield
                                                    TouristTab.TRANSLATOR -> if (isSelected) Icons.Filled.Translate else Icons.Outlined.Translate
                                                    TouristTab.AI_PLANNER -> if (isSelected) Icons.Filled.AutoAwesome else Icons.Outlined.AutoAwesome
                                                    TouristTab.PASSES -> if (isSelected) Icons.Filled.ConfirmationNumber else Icons.Outlined.ConfirmationNumber
                                                },
                                                contentDescription = tab.label
                                            )
                                        },
                                        label = {
                                            Text(
                                                text = tab.label,
                                                fontSize = 10.sp,
                                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                                            )
                                        },
                                        colors = NavigationBarItemDefaults.colors(
                                            selectedIconColor = SaffronPrimary,
                                            selectedTextColor = SaffronPrimary,
                                            indicatorColor = SaffronPrimary.copy(alpha = 0.15f),
                                            unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
                                            unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant
                                        ),
                                        modifier = Modifier.testTag("nav_tab_${tab.name}")
                                    )
                                }
                            }
                        }
                    },
                    snackbarHost = { SnackbarHost(snackbarHostState) }
                ) { innerPadding ->
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(innerPadding)
                    ) {
                        AnimatedContent(
                            targetState = Pair(uiState.appMode, uiState.currentTouristTab),
                            transitionSpec = {
                                fadeIn() togetherWith fadeOut()
                            },
                            label = "ScreenTransition"
                        ) { (mode, tab) ->
                            if (mode == AppMode.SERVICE_PROVIDER) {
                                ServiceProviderScreen(
                                    uiState = uiState,
                                    onSimulateScan = { viewModel.simulateScanTicket() },
                                    onDismissScanResult = { viewModel.dismissScanResult() },
                                    onSwitchToTourist = { viewModel.setAppMode(AppMode.TOURIST) }
                                )
                            } else {
                                when (tab) {
                                    TouristTab.EXPLORE -> {
                                        ExploreScreen(
                                            uiState = uiState,
                                            onSelectCategory = { cat -> viewModel.setCategory(cat) },
                                            onSelectCity = { city -> viewModel.setCity(city) },
                                            onSearchChange = { query -> viewModel.setSearchQuery(query) },
                                            onBookItem = { item -> viewModel.openBooking(item) }
                                        )
                                    }
                                    TouristTab.SAFETY_RADAR -> {
                                        SafetyRadarScreen(
                                            uiState = uiState,
                                            onTriggerSos = { type -> viewModel.triggerSos(type) },
                                            onCancelSos = { viewModel.cancelSos() },
                                            onToggleSiren = { viewModel.toggleSiren() }
                                        )
                                    }
                                    TouristTab.TRANSLATOR -> {
                                        BhashiniTranslatorScreen(
                                            uiState = uiState,
                                            onLanguageFromChange = { lang -> viewModel.setLanguageFrom(lang) },
                                            onLanguageToChange = { lang -> viewModel.setLanguageTo(lang) },
                                            onInputChange = { text -> viewModel.setTranslationInput(text) },
                                            onTranslate = { viewModel.translateCurrentInput() },
                                            onApplyQuickPhrase = { phrase -> viewModel.applyQuickPhrase(phrase) }
                                        )
                                    }
                                    TouristTab.AI_PLANNER -> {
                                        AiPlannerScreen(
                                            uiState = uiState,
                                            onQueryChange = { q -> viewModel.setPlannerQuery(q) },
                                            onGeneratePlan = { viewModel.generateAiItinerary() }
                                        )
                                    }
                                    TouristTab.PASSES -> {
                                        PassesWalletScreen(
                                            uiState = uiState
                                        )
                                    }
                                }
                            }
                        }

                        // Booking Confirmation Modal Dialog
                        if (uiState.activeBookingItem != null) {
                            BookingConfirmationDialog(
                                item = uiState.activeBookingItem!!,
                                onDismiss = { viewModel.closeBooking() },
                                onConfirm = { title, category, details, amount ->
                                    viewModel.confirmBooking(title, category, details, amount)
                                }
                            )
                        }
                    }
                }
            }
        }
    }
}
}




