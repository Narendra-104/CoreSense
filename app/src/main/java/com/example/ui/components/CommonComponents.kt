package com.example.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.AppMode
import com.example.model.CrowdLevel
import com.example.ui.theme.*

@Composable
fun TopAppBarWithStatus(
    appMode: AppMode,
    onToggleMode: (AppMode) -> Unit,
    onQuickSosClick: () -> Unit,
    userProfile: com.example.model.UserProfile? = null,
    onLogout: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    var isProfileMenuExpanded by androidx.compose.runtime.remember { androidx.compose.runtime.mutableStateOf(false) }

    Surface(
        modifier = modifier.fillMaxWidth(),
        color = MaterialTheme.colorScheme.surface,
        shadowElevation = 2.dp
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .statusBarsPadding()
                .padding(horizontal = 16.dp, vertical = 10.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(40.dp)
                            .clip(RoundedCornerShape(10.dp))
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
                            modifier = Modifier.size(24.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "HyperTour AI",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Surface(
                                color = SaffronPrimary.copy(alpha = 0.15f),
                                shape = RoundedCornerShape(4.dp)
                            ) {
                                Text(
                                    text = "SIH 2026",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = SaffronPrimary,
                                    modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp)
                                )
                            }
                        }
                        Text(
                            text = if (userProfile != null) "Hi, ${userProfile.name}" else "Smart AI Hub • TeamHyper",
                            fontSize = 11.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    // Mode Switcher Pill
                    Surface(
                        shape = RoundedCornerShape(20.dp),
                        color = MaterialTheme.colorScheme.surfaceVariant,
                        border = androidx.compose.foundation.BorderStroke(1.dp, CardBorder),
                        modifier = Modifier
                            .clip(RoundedCornerShape(20.dp))
                            .clickable {
                                val nextMode = if (appMode == AppMode.TOURIST) AppMode.SERVICE_PROVIDER else AppMode.TOURIST
                                onToggleMode(nextMode)
                            }
                            .testTag("mode_toggle_button")
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                        ) {
                            Icon(
                                imageVector = if (appMode == AppMode.TOURIST) Icons.Default.Person else Icons.Default.Badge,
                                contentDescription = "Mode",
                                modifier = Modifier.size(16.dp),
                                tint = if (appMode == AppMode.TOURIST) SaffronPrimary else CyanAccent
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = if (appMode == AppMode.TOURIST) "Tourist" else "Provider",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }
                    }

                    Spacer(modifier = Modifier.width(6.dp))

                    // User Profile / Logout Dropdown
                    Box {
                        IconButton(
                            onClick = { isProfileMenuExpanded = true },
                            modifier = Modifier
                                .size(36.dp)
                                .clip(CircleShape)
                                .background(MaterialTheme.colorScheme.surfaceVariant)
                                .testTag("user_profile_button")
                        ) {
                            Text(
                                text = userProfile?.avatarInitials ?: "HT",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = SaffronPrimary
                            )
                        }

                        DropdownMenu(
                            expanded = isProfileMenuExpanded,
                            onDismissRequest = { isProfileMenuExpanded = false }
                        ) {
                            DropdownMenuItem(
                                text = {
                                    Column {
                                        Text(
                                            text = userProfile?.name ?: "Tourist User",
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 14.sp
                                        )
                                        Text(
                                            text = userProfile?.emailOrPhone ?: "Verified Account",
                                            fontSize = 11.sp,
                                            color = Color.Gray
                                        )
                                    }
                                },
                                onClick = {},
                                leadingIcon = {
                                    Icon(
                                        Icons.Default.AccountCircle,
                                        contentDescription = null,
                                        tint = SaffronPrimary
                                    )
                                }
                            )
                            HorizontalDivider()
                            DropdownMenuItem(
                                text = { Text("Switch to ${if (appMode == AppMode.TOURIST) "Provider Mode" else "Tourist Mode"}") },
                                onClick = {
                                    isProfileMenuExpanded = false
                                    onToggleMode(if (appMode == AppMode.TOURIST) AppMode.SERVICE_PROVIDER else AppMode.TOURIST)
                                },
                                leadingIcon = {
                                    Icon(
                                        if (appMode == AppMode.TOURIST) Icons.Default.Badge else Icons.Default.Person,
                                        contentDescription = null
                                    )
                                }
                            )
                            HorizontalDivider()
                            DropdownMenuItem(
                                text = { Text("Sign Out / Switch User", color = SOSRed, fontWeight = FontWeight.SemiBold) },
                                onClick = {
                                    isProfileMenuExpanded = false
                                    onLogout()
                                },
                                leadingIcon = {
                                    Icon(
                                        Icons.Default.ExitToApp,
                                        contentDescription = "Logout",
                                        tint = SOSRed
                                    )
                                }
                            )
                        }
                    }

                    Spacer(modifier = Modifier.width(6.dp))

                    // Instant SOS Button
                    IconButton(
                        onClick = onQuickSosClick,
                        modifier = Modifier
                            .size(38.dp)
                            .clip(CircleShape)
                            .background(SOSRed.copy(alpha = 0.12f))
                            .testTag("quick_sos_button")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Sos,
                            contentDescription = "Instant SOS 112",
                            tint = SOSRed,
                            modifier = Modifier.size(22.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Geo-fence status banner
            Surface(
                color = EmeraldSuccess.copy(alpha = 0.08f),
                shape = RoundedCornerShape(8.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, EmeraldSuccess.copy(alpha = 0.3f)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 10.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .clip(CircleShape)
                                .background(EmeraldSuccess)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "Geo-fence: Safe Heritage Zone Active",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium,
                            color = EmeraldSuccess
                        )
                    }
                    Text(
                        text = "ERSS 112 Connected",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = NavySecondary
                    )
                }
            }
        }
    }
}

@Composable
fun ProtectedPriceBadge(
    modifier: Modifier = Modifier,
    amount: Double,
    unitText: String = ""
) {
    Surface(
        color = EmeraldSuccess.copy(alpha = 0.1f),
        shape = RoundedCornerShape(6.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, EmeraldSuccess.copy(alpha = 0.4f)),
        modifier = modifier
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
        ) {
            Icon(
                imageVector = Icons.Default.VerifiedUser,
                contentDescription = "Price Protected",
                tint = EmeraldSuccess,
                modifier = Modifier.size(14.dp)
            )
            Spacer(modifier = Modifier.width(4.dp))
            Text(
                text = "₹${amount.toInt()} $unitText (Fixed Fare)",
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = EmeraldSuccess
            )
        }
    }
}

@Composable
fun CrowdLevelBadge(
    crowdLevel: CrowdLevel,
    modifier: Modifier = Modifier
) {
    val (bgColor, textColor, icon) = when (crowdLevel) {
        CrowdLevel.LOW -> Triple(EmeraldSuccess.copy(alpha = 0.12f), EmeraldSuccess, Icons.Default.CheckCircle)
        CrowdLevel.MODERATE -> Triple(SaffronPrimary.copy(alpha = 0.12f), SaffronPrimary, Icons.Default.Info)
        CrowdLevel.HIGH -> Triple(SOSRed.copy(alpha = 0.12f), SOSRed, Icons.Default.Warning)
    }

    Surface(
        color = bgColor,
        shape = RoundedCornerShape(6.dp),
        modifier = modifier
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = textColor,
                modifier = Modifier.size(12.dp)
            )
            Spacer(modifier = Modifier.width(4.dp))
            Text(
                text = crowdLevel.label,
                fontSize = 11.sp,
                fontWeight = FontWeight.Medium,
                color = textColor
            )
        }
    }
}

@Composable
fun DynamicQrCodeView(
    dataString: String,
    modifier: Modifier = Modifier
) {
    // Elegant procedural 2D QR matrix representation
    Surface(
        modifier = modifier
            .size(140.dp)
            .clip(RoundedCornerShape(12.dp))
            .background(Color.White)
            .border(1.dp, CardBorder, RoundedCornerShape(12.dp))
            .padding(12.dp),
        color = Color.White
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val numBlocks = 15
            val blockSize = size.width / numBlocks
            val hash = dataString.hashCode()

            for (i in 0 until numBlocks) {
                for (j in 0 until numBlocks) {
                    val isCornerFinder = (i < 4 && j < 4) || (i < 4 && j >= numBlocks - 4) || (i >= numBlocks - 4 && j < 4)
                    val isFinderBorder = (i == 0 || i == 3 || j == 0 || j == 3) && (i < 4 && j < 4)
                    val isFinderCenter = (i == 1 && j == 1) || (i == 2 && j == 1) || (i == 1 && j == 2) || (i == 2 && j == 2)

                    val isFilled = if (isCornerFinder) {
                        isFinderBorder || isFinderCenter
                    } else {
                        ((i * 31 + j * 17 + hash) % 3 == 0) || ((i + j) % 4 == 0)
                    }

                    if (isFilled) {
                        drawRect(
                            color = Color(0xFF0F172A),
                            topLeft = Offset(i * blockSize, j * blockSize),
                            size = Size(blockSize - 0.5f, blockSize - 0.5f)
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun BookingConfirmationDialog(
    item: Any,
    onDismiss: () -> Unit,
    onConfirm: (title: String, category: String, details: String, amount: Double) -> Unit
) {
    var title = ""
    var category = ""
    var details = ""
    var amount = 0.0

    when (item) {
        is com.example.model.AttractionItem -> {
            title = item.name
            category = "ASI Monument Ticket"
            details = "${item.city} • Safe Hours: ${item.safeHours}"
            amount = item.officialPriceInr
        }
        is com.example.model.VerifiedGuide -> {
            title = "Verified Guide: ${item.name}"
            category = "Certified Guide Booking"
            details = "Badge ${item.badgeNumber} • ${item.languages.joinToString(", ")}"
            amount = item.ratePerHourInr * 2 // 2-hr standard tour
        }
        is com.example.model.TransitOption -> {
            title = "${item.type} Booking"
            category = "Safe Transit"
            details = "${item.routeDescription} • Driver: ${item.driverName}"
            amount = item.officialRatePerKmOrPass * 10 // estimate 10 km
        }
        is com.example.model.StayOption -> {
            title = item.name
            category = "Certified Stay"
            details = "${item.city} • ${item.govtCertifiedBadge}"
            amount = item.pricePerNightInr
        }
    }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Default.Shield,
                    contentDescription = null,
                    tint = SaffronPrimary,
                    modifier = Modifier.size(24.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text("Confirm Verified Booking", style = MaterialTheme.typography.titleMedium)
            }
        },
        text = {
            Column(modifier = Modifier.fillMaxWidth()) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.bodyLarge,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = details,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.height(12.dp))

                Surface(
                    color = MaterialTheme.colorScheme.surfaceVariant,
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Official Base Tariff:", fontSize = 12.sp)
                            Text("₹${amount.toInt()}", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Price Gouging Surcharge:", fontSize = 12.sp, color = EmeraldSuccess)
                            Text("₹0 (Protected)", fontSize = 12.sp, color = EmeraldSuccess, fontWeight = FontWeight.Bold)
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Divider(color = CardBorder)
                        Spacer(modifier = Modifier.height(4.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Total Payable:", fontSize = 14.sp, fontWeight = FontWeight.Bold)
                            Text("₹${amount.toInt()}", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = SaffronPrimary)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.CheckCircle,
                        contentDescription = null,
                        tint = EmeraldSuccess,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Generates offline-accessible QR pass instantly",
                        fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        },
        confirmButton = {
            Button(
                onClick = { onConfirm(title, category, details, amount) },
                colors = ButtonDefaults.buttonColors(containerColor = SaffronPrimary),
                modifier = Modifier.testTag("confirm_booking_button")
            ) {
                Text("Pay & Generate Pass (UPI / Card)")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}
