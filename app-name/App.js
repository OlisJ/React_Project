import {
    StyleSheet,
    View,
    Text,
    TextInput,
    Image,
    FlatList,
    ActivityIndicator,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    Animated,
} from 'react-native';

import Axios from "axios";
import { useEffect, useState } from "react";
import { BlurView } from 'expo-blur';

function App() {
    const [search, setSearch] = useState("");
    const [crypto, setCrypto] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeScreen, setActiveScreen] = useState('Home');
    const [currency, setCurrency] = useState('INR');
    const [sortBy, setSortBy] = useState('rank');
    
    // Animation states
    const pulseAnim = new Animated.Value(0.8);
    const wave1Anim = new Animated.Value(20);
    const wave2Anim = new Animated.Value(20);
    
    const EUR_TO_INR = 88.5; // Conversion rate
    const USD_TO_INR = 83.2; // Conversion rate

    // Format price based on selected currency
    const formatPrice = (priceInINR) => {
        if (currency === 'EUR') {
            return `€${(priceInINR / EUR_TO_INR).toFixed(2)}`;
        } else if (currency === 'USD') {
            return `$${(priceInINR / USD_TO_INR).toFixed(2)}`;
        }
        return `₹${priceInINR.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
    };

    // Format large numbers
    const formatNumber = (num) => {
        if (currency === 'EUR') {
            return `€${(num / EUR_TO_INR).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
        } else if (currency === 'USD') {
            return `$${(num / USD_TO_INR).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
        }
        return `₹${num.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await Axios.get(
                    'https://api.coingecko.com/api/v3/coins/markets?vs_currency=inr&order=market_cap_desc&per_page=100&page=1&sparkline=false'
                );

                const transformedData = res.data.map((coin, index) => ({
                    id: coin.id,
                    rank: coin.market_cap_rank || index + 1,
                    name: coin.name,
                    symbol: coin.symbol.toUpperCase(),
                    icon: coin.image,
                    marketCap: coin.market_cap || 0,
                    price: coin.current_price || 0,
                    volume: coin.total_volume || 0,
                }));

                setCrypto(transformedData);
                setLoading(false);
            } catch (e) {
                setError("Failed to fetch data");
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Animation effects
    useEffect(() => {
        // Subtle continuous pulse animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 3000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0.8,
                    duration: 3000,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Wave animation 1
        Animated.loop(
            Animated.timing(wave1Anim, {
                toValue: 100,
                duration: 2000,
                useNativeDriver: true,
            })
        ).start();

        // Wave animation 2
        Animated.loop(
            Animated.timing(wave2Anim, {
                toValue: 100,
                duration: 2500,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    const filteredCrypto = crypto.filter((val) =>
        val.name.toLowerCase().includes(search.toLowerCase())
    );

    // Sorting logic
    const getSortedCrypto = (data, sortOption) => {
        const sorted = [...data];
        switch (sortOption) {
            case 'price_high':
                return sorted.sort((a, b) => b.price - a.price);
            case 'price_low':
                return sorted.sort((a, b) => a.price - b.price);
            case 'market_cap':
                return sorted.sort((a, b) => b.marketCap - a.marketCap);
            case 'volume':
                return sorted.sort((a, b) => b.volume - a.volume);
            default:
                return sorted;
        }
    };

    const sortedFilteredCrypto = getSortedCrypto(filteredCrypto, sortBy);

    const totalMarketCap = crypto.reduce((sum, c) => sum + c.marketCap, 0);
    const totalVolume = crypto.reduce((sum, c) => sum + c.volume, 0);
    const averagePrice = crypto.length ? crypto.reduce((sum, c) => sum + c.price, 0) / crypto.length : 0;
    const topMarketCapCoins = [...crypto].sort((a, b) => b.marketCap - a.marketCap).slice(0, 4);
    const topVolumeCoins = [...crypto].sort((a, b) => b.volume - a.volume).slice(0, 4);

    const renderCryptoItem = ({ item }) => (
        <View style={styles.card}>
            <Text style={styles.rank}>{item.rank}</Text>

            <View style={styles.coinInfo}>
                {item.icon && (
                    <Image source={{ uri: item.icon }} style={styles.icon} />
                )}
                <Text style={styles.name}>{item.name}</Text>
            </View>

            <View style={styles.rightInfo}>
                <Text style={styles.symbol}>{item.symbol}</Text>
                <Text style={styles.price}>{formatPrice(item.price)}</Text>
            </View>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color="#A855F7" />
                <Text style={styles.loading}>Loading...</Text>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.error}>{error}</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>

            {/* CREATIVE HEADER WITH FLOATING SELECTOR */}
            <View style={styles.headerSection}>
                {/* Wavy background */}
                <Animated.View
                    style={[
                        styles.waveBackground,
                        {
                            transform: [
                                {
                                    translateX: wave1Anim.interpolate({
                                        inputRange: [0, 100],
                                        outputRange: [0, 60],
                                    }),
                                },
                            ],
                        },
                    ]}
                />
                <Animated.View
                    style={[
                        styles.waveBackground2,
                        {
                            transform: [
                                {
                                    translateX: wave2Anim.interpolate({
                                        inputRange: [0, 100],
                                        outputRange: [0, -60],
                                    }),
                                },
                            ],
                        },
                    ]}
                />

                <View style={styles.titleBar}>
                    <View style={styles.titleContainer}>
                        <Animated.View
                            style={[
                                styles.glowEffect,
                                {
                                    opacity: pulseAnim.interpolate({
                                        inputRange: [0.8, 1.1],
                                        outputRange: [0.4, 0.8],
                                    }),
                                },
                            ]}
                        />
                        <Text style={styles.mainTitle}>
                            Market Flux
                        </Text>
                    </View>
                    <Text style={styles.subtitle}>
                        Real-time crypto intelligence
                    </Text>
                </View>

                <View style={styles.selectorBar}>
                    <BlurView intensity={40} tint="light" style={styles.selectorBlur}>
                        <View style={styles.selector}>
                            <TouchableOpacity 
                                onPress={() => setActiveScreen('Home')}
                                style={[styles.selectorTab, activeScreen === 'Home' && styles.selectorTabActive]}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.selectorIndicator, activeScreen === 'Home' && styles.activeIndicator]} />
                                <Text style={[styles.selectorText, activeScreen === 'Home' && styles.selectorTextActive]}>
                                    {activeScreen === 'Home' ? '◆' : '○'} Home
                                </Text>
                            </TouchableOpacity>

                            <View style={styles.divider} />

                            <TouchableOpacity 
                                onPress={() => setActiveScreen('Markets')}
                                style={[styles.selectorTab, activeScreen === 'Markets' && styles.selectorTabActive]}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.selectorIndicator, activeScreen === 'Markets' && styles.activeIndicator]} />
                                <Text style={[styles.selectorText, activeScreen === 'Markets' && styles.selectorTextActive]}>
                                    {activeScreen === 'Markets' ? '◆' : '○'} Markets
                                </Text>
                            </TouchableOpacity>

                            <View style={styles.divider} />

                            <TouchableOpacity 
                                onPress={() => setActiveScreen('Insights')}
                                style={[styles.selectorTab, activeScreen === 'Insights' && styles.selectorTabActive]}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.selectorIndicator, activeScreen === 'Insights' && styles.activeIndicator]} />
                                <Text style={[styles.selectorText, activeScreen === 'Insights' && styles.selectorTextActive]}>
                                    {activeScreen === 'Insights' ? '◆' : '○'} Insights
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </BlurView>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* HOME SCREEN */}
                {activeScreen === 'Home' && (
                    <>
                        <Text style={styles.title}>All Cryptocurrencies</Text>

                        {/* Currency Toggle */}
                        <View style={styles.currencyToggle}>
                            <TouchableOpacity 
                                onPress={() => setCurrency('INR')}
                                style={[styles.currencyBtn, currency === 'INR' && styles.currencyBtnActive]}
                            >
                                <Text style={[styles.currencyBtnText, currency === 'INR' && styles.currencyBtnTextActive]}>
                                    ₹ INR
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={() => setCurrency('EUR')}
                                style={[styles.currencyBtn, currency === 'EUR' && styles.currencyBtnActive]}
                            >
                                <Text style={[styles.currencyBtnText, currency === 'EUR' && styles.currencyBtnTextActive]}>
                                    € EUR
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={() => setCurrency('USD')}
                                style={[styles.currencyBtn, currency === 'USD' && styles.currencyBtnActive]}
                            >
                                <Text style={[styles.currencyBtnText, currency === 'USD' && styles.currencyBtnTextActive]}>
                                    $ USD
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={styles.search}
                            placeholder="Search coin..."
                            placeholderTextColor="#777"
                            value={search}
                            onChangeText={setSearch}
                        />

                        {/* Sorting Filters */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                            <TouchableOpacity 
                                onPress={() => setSortBy('rank')}
                                style={[styles.filterBtn, sortBy === 'rank' && styles.filterBtnActive]}
                            >
                                <Text style={[styles.filterBtnText, sortBy === 'rank' && styles.filterBtnTextActive]}>
                                    Rank
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={() => setSortBy('price_high')}
                                style={[styles.filterBtn, sortBy === 'price_high' && styles.filterBtnActive]}
                            >
                                <Text style={[styles.filterBtnText, sortBy === 'price_high' && styles.filterBtnTextActive]}>
                                    Price ↓
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={() => setSortBy('price_low')}
                                style={[styles.filterBtn, sortBy === 'price_low' && styles.filterBtnActive]}
                            >
                                <Text style={[styles.filterBtnText, sortBy === 'price_low' && styles.filterBtnTextActive]}>
                                    Price ↑
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={() => setSortBy('market_cap')}
                                style={[styles.filterBtn, sortBy === 'market_cap' && styles.filterBtnActive]}
                            >
                                <Text style={[styles.filterBtnText, sortBy === 'market_cap' && styles.filterBtnTextActive]}>
                                    Market Cap
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={() => setSortBy('volume')}
                                style={[styles.filterBtn, sortBy === 'volume' && styles.filterBtnActive]}
                            >
                                <Text style={[styles.filterBtnText, sortBy === 'volume' && styles.filterBtnTextActive]}>
                                    Volume
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>

                        <View style={styles.statsRow}>
                            <View style={styles.statCard}>
                                <Text style={styles.statLabel}>Market Cap</Text>
                                <Text style={styles.statValue}>
                                    {formatNumber(totalMarketCap)}
                                </Text>
                            </View>

                            <View style={styles.statCard}>
                                <Text style={styles.statLabel}>Volume</Text>
                                <Text style={styles.statValue}>
                                    {formatNumber(totalVolume)}
                                </Text>
                            </View>
                        </View>

                        <FlatList
                            data={sortedFilteredCrypto}
                            renderItem={renderCryptoItem}
                            keyExtractor={(item) => item.id}
                            scrollEnabled={false}
                        />
                    </>
                )}

                {/* MARKETS SCREEN */}
                {activeScreen === 'Markets' && (
                    <>
                        <Text style={styles.screenTitle}>Market Overview</Text>

                        <View style={styles.metricsGrid}>
                            <View style={styles.metricCard}>
                                <Text style={styles.metricLabel}>Total Market Cap</Text>
                                <Text style={styles.metricValue}>{formatNumber(totalMarketCap)}</Text>
                            </View>
                            <View style={styles.metricCard}>
                                <Text style={styles.metricLabel}>24h Volume</Text>
                                <Text style={styles.metricValue}>{formatNumber(totalVolume)}</Text>
                            </View>
                        </View>

                        <Text style={styles.sectionTitle}>Top Market Cap</Text>
                        {topMarketCapCoins.map((coin) => (
                            <View key={coin.id} style={styles.insightRow}>
                                <View style={styles.coinRow}>
                                    {coin.icon && <Image source={{ uri: coin.icon }} style={styles.smallIcon} />}
                                    <Text style={styles.insightName}>{coin.name}</Text>
                                </View>
                                <Text style={styles.insightValue}>{formatNumber(coin.marketCap)}</Text>
                            </View>
                        ))}

                        <Text style={styles.sectionTitle}>Top Volume</Text>
                        {topVolumeCoins.map((coin) => (
                            <View key={coin.id} style={styles.insightRow}>
                                <View style={styles.coinRow}>
                                    {coin.icon && <Image source={{ uri: coin.icon }} style={styles.smallIcon} />}
                                    <Text style={styles.insightName}>{coin.name}</Text>
                                </View>
                                <Text style={styles.insightValue}>{formatNumber(coin.volume)}</Text>
                            </View>
                        ))}
                    </>
                )}

                {/* INSIGHTS SCREEN */}
                {activeScreen === 'Insights' && (
                    <>
                        <Text style={styles.screenTitle}>Market Insights</Text>

                        <View style={styles.insightCard}>
                            <Text style={styles.insightCardTitle}>Market Health</Text>
                            <Text style={styles.insightCardText}>
                                Overall market liquidity is strong with a total volume of {formatNumber(totalVolume)} today. This indicates robust trading activity across all major coins.
                            </Text>
                        </View>

                        <View style={styles.insightCard}>
                            <Text style={styles.insightCardTitle}>Average Price</Text>
                            <Text style={styles.insightCardText}>
                                Average listed coin price is {formatPrice(averagePrice)}, indicating broad mid-market interest and diverse investment opportunities across the market spectrum.
                            </Text>
                        </View>

                        <View style={styles.insightCard}>
                            <Text style={styles.insightCardTitle}>Top Performing Sectors</Text>
                            <Text style={styles.insightCardText}>
                                Large-cap assets are leading volume, with several top-cap coins showing stable demand. Market stability is at healthy levels with consistent patterns.
                            </Text>
                        </View>

                        <View style={styles.insightCard}>
                            <Text style={styles.insightCardTitle}>Market Trend Analysis</Text>
                            <Text style={styles.insightCardText}>
                                The cryptocurrency market continues to show strong fundamentals with consistent trading patterns. {topMarketCapCoins.length > 0 ? `${topMarketCapCoins[0]?.name} leads market capitalization` : 'Top coins dominate the market'}, indicating investor confidence in established cryptocurrencies.
                            </Text>
                        </View>

                        <View style={styles.insightCard}>
                            <Text style={styles.insightCardTitle}>Volume Distribution</Text>
                            <Text style={styles.insightCardText}>
                                Trading volume is well-distributed across the top cryptocurrencies, suggesting healthy market activity and reduced concentration risk. This diversity strengthens overall market resilience.
                            </Text>
                        </View>

                        <View style={styles.insightCard}>
                            <Text style={styles.insightCardTitle}>Market Statistics</Text>
                            <View style={styles.statsContainer}>
                                <View style={styles.statItem}>
                                    <Text style={styles.statItemLabel}>Total Assets Tracked</Text>
                                    <Text style={styles.statItemValue}>{crypto.length}</Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text style={styles.statItemLabel}>Global Market Cap</Text>
                                    <Text style={styles.statItemValue}>{formatNumber(totalMarketCap)}</Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text style={styles.statItemLabel}>24h Trading Volume</Text>
                                    <Text style={styles.statItemValue}>{formatNumber(totalVolume)}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.insightCard}>
                            <Text style={styles.insightCardTitle}>Investment Opportunities</Text>
                            <Text style={styles.insightCardText}>
                                With {crypto.length} cryptocurrencies tracked, investors have diverse options across different market caps and use cases. Monitor price movements and volume trends to identify emerging opportunities in the market.
                            </Text>
                        </View>

                        <View style={styles.insightCard}>
                            <Text style={styles.insightCardTitle}>Risk Management Tips</Text>
                            <Text style={styles.insightCardText}>
                                • Diversify across different cryptocurrencies and market caps{'\n'}
                                • Monitor daily volume and market trends{'\n'}
                                • Set price alerts for major cryptocurrencies{'\n'}
                                • Review market indicators regularly
                            </Text>
                        </View>

                        <View style={styles.insightCard}>
                            <Text style={styles.insightCardTitle}>Currency Information</Text>
                            <Text style={styles.insightCardText}>
                                Current display: <Text style={styles.highlight}>{currency === 'EUR' ? '€ EUR (Euro)' : currency === 'USD' ? '$ USD (US Dollar)' : '₹ INR (Indian Rupee)'}</Text>{'\n'}
                                <Text style={styles.note}>
                                    {currency === 'EUR' ? `Conversion Rate: 1 EUR ≈ ${EUR_TO_INR} INR` : currency === 'USD' ? `Conversion Rate: 1 USD ≈ ${USD_TO_INR} INR` : 'Base Currency: Indian Rupee (INR)'}
                                </Text>
                            </Text>
                        </View>
                    </>
                )}

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#F5F3FF',
        paddingHorizontal: 16,
    },

    scrollContent: {
        paddingBottom: 30,
    },

    /* NEW CREATIVE HEADER */
    headerSection: {
        marginVertical: 8,
        marginBottom: 12,
        overflow: 'hidden',
        borderRadius: 16,
        backgroundColor: '#F5F3FF',
        position: 'relative',
        paddingVertical: 12,
    },

    waveBackground: {
        position: 'absolute',
        top: -10,
        left: 0,
        right: 0,
        height: 160,
        backgroundColor: 'transparent',
        borderBottomWidth: 4,
        borderBottomColor: 'rgba(168,85,247,0.25)',
        borderRadius: 50,
    },

    waveBackground2: {
        position: 'absolute',
        top: 40,
        left: 0,
        right: 0,
        height: 140,
        backgroundColor: 'transparent',
        borderBottomWidth: 3.5,
        borderBottomColor: 'rgba(168,85,247,0.15)',
        borderRadius: 50,
    },

    titleBar: {
        marginBottom: 4,
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 16,
    },

    titleContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },

    glowEffect: {
        position: 'absolute',
        width: 240,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(168,85,247,0.2)',
        top: '50%',
        left: '50%',
        marginLeft: -120,
        marginTop: -50,
        zIndex: 0,
    },

    mainTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#2D1B4E',
        letterSpacing: -0.5,
        textAlign: 'center',
    },

    subtitle: {
        fontSize: 11,
        color: '#7C3AED',
        marginTop: 1,
        fontWeight: '500',
        textAlign: 'center',
    },

    selectorBar: {
        borderRadius: 14,
        overflow: 'hidden',
        marginTop: 12,
    },

    selectorBlur: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: 'rgba(168,85,247,0.12)',
        borderWidth: 1.5,
        borderColor: 'rgba(168,85,247,0.3)',
    },

    selector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },

    selectorTab: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderRadius: 12,
    },

    selectorTabActive: {
        backgroundColor: 'rgba(168,85,247,0.2)',
    },

    selectorIndicator: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'rgba(109,40,217,0.25)',
    },

    activeIndicator: {
        backgroundColor: '#A855F7',
        width: 8,
        height: 8,
        shadowColor: '#A855F7',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 5,
    },

    selectorText: {
        color: 'rgba(109,40,217,0.6)',
        fontSize: 16,
        fontWeight: '600',
    },

    selectorTextActive: {
        color: '#6D28D9',
        fontWeight: '700',
        fontSize: 16,
    },

    divider: {
        width: 1.5,
        height: 28,
        backgroundColor: 'rgba(168,85,247,0.2)',
    },

    /* NAVBAR GLASSMORPHISM */
    navWrapper: {
        marginVertical: 12,
    },

    navbar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 18,
        borderRadius: 18,
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
    },

    logo: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 0.5,
    },

    navButtons: {
        flexDirection: 'row',
        gap: 10,
    },

    navBtn: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },

    navBtnActive: {
        backgroundColor: 'rgba(0,255,204,0.15)',
        borderColor: 'rgba(0,255,204,0.4)',
    },

    navBtnText: {
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '600',
        fontSize: 14,
    },

    navBtnTextActive: {
        color: '#00ffcc',
        fontWeight: '700',
        fontSize: 14,
    },

    /* HOME */
    title: {
        fontSize: 26,
        color: '#2D1B4E',
        fontWeight: '800',
        marginBottom: 10,
    },

    search: {
        backgroundColor: 'rgba(168,85,247,0.12)',
        borderRadius: 14,
        padding: 12,
        color: '#2D1B4E',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(168,85,247,0.25)',
    },

    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },

    statCard: {
        flex: 1,
        backgroundColor: 'rgba(168,85,247,0.15)',
        padding: 14,
        borderRadius: 14,
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: 'rgba(168,85,247,0.3)',
    },

    statLabel: {
        color: '#6D28D9',
        fontSize: 12,
        fontWeight: '600',
    },

    statValue: {
        color: '#4C1D95',
        fontWeight: '700',
        marginTop: 6,
        fontSize: 16,
    },

    /* LIST */
    card: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 14,
        marginBottom: 10,
        borderRadius: 14,
        backgroundColor: 'rgba(168,85,247,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(168,85,247,0.25)',
    },

    rank: {
        color: '#6D28D9',
        width: 30,
    },

    coinInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },

    icon: {
        width: 26,
        height: 26,
        marginRight: 10,
    },

    name: {
        color: '#2D1B4E',
        fontWeight: '600',
    },

    rightInfo: {
        alignItems: 'flex-end',
    },

    symbol: {
        color: '#6D28D9',
        fontSize: 12,
        fontWeight: '600',
    },

    price: {
        color: '#4C1D95',
        fontWeight: '700',
        fontSize: 14,
    },

    /* OTHER SCREENS */
    screenTitle: {
        fontSize: 28,
        color: '#2D1B4E',
        fontWeight: '800',
        marginBottom: 20,
        marginTop: 10,
    },

    sectionTitle: {
        fontSize: 16,
        color: '#4C1D95',
        fontWeight: '700',
        marginBottom: 12,
        marginTop: 18,
    },

    metricsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
        gap: 12,
    },

    metricCard: {
        flex: 1,
        backgroundColor: 'rgba(168,85,247,0.15)',
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(168,85,247,0.3)',
    },

    metricLabel: {
        color: '#6D28D9',
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 8,
    },

    metricValue: {
        color: '#4C1D95',
        fontSize: 16,
        fontWeight: '800',
    },

    insightRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        backgroundColor: 'rgba(168,85,247,0.1)',
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(168,85,247,0.25)',
    },

    coinRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },

    smallIcon: {
        width: 24,
        height: 24,
        marginRight: 10,
        borderRadius: 6,
    },

    insightName: {
        color: '#2D1B4E',
        fontWeight: '600',
        fontSize: 14,
    },

    insightValue: {
        color: '#6D28D9',
        fontWeight: '700',
        fontSize: 14,
    },

    insightCard: {
        backgroundColor: 'rgba(168,85,247,0.12)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: 'rgba(168,85,247,0.25)',
    },

    insightCardTitle: {
        color: '#4C1D95',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 8,
    },

    insightCardText: {
        color: '#5B4A7A',
        fontSize: 14,
        lineHeight: 22,
    },

    currencyToggle: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 16,
    },

    currencyBtn: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 12,
        backgroundColor: 'rgba(168,85,247,0.1)',
        borderWidth: 1.5,
        borderColor: 'rgba(168,85,247,0.25)',
    },

    currencyBtnActive: {
        backgroundColor: 'rgba(168,85,247,0.25)',
        borderColor: '#A855F7',
    },

    currencyBtnText: {
        color: '#6D28D9',
        fontWeight: '600',
        fontSize: 14,
    },

    currencyBtnTextActive: {
        color: '#4C1D95',
        fontWeight: '700',
    },

    filterScroll: {
        marginBottom: 14,
    },

    filterBtn: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 10,
        backgroundColor: 'rgba(168,85,247,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(168,85,247,0.25)',
        marginRight: 8,
    },

    filterBtnActive: {
        backgroundColor: 'rgba(168,85,247,0.3)',
        borderColor: '#A855F7',
    },

    filterBtnText: {
        color: '#6D28D9',
        fontWeight: '600',
        fontSize: 13,
    },

    filterBtnTextActive: {
        color: '#4C1D95',
        fontWeight: '700',
    },

    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
        gap: 8,
    },

    statItem: {
        flex: 1,
        backgroundColor: 'rgba(168,85,247,0.15)',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
    },

    statItemLabel: {
        color: '#6D28D9',
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 6,
    },

    statItemValue: {
        color: '#4C1D95',
        fontWeight: '700',
        fontSize: 12,
    },

    highlight: {
        color: '#A855F7',
        fontWeight: '700',
    },

    note: {
        color: '#9D4EDD',
        fontSize: 12,
        marginTop: 6,
    },

    screen: {
        padding: 20,
        backgroundColor: 'rgba(168,85,247,0.1)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(168,85,247,0.25)',
        marginTop: 10,
    },

    screenText: {
        color: '#5B4A7A',
        marginTop: 6,
    },

    loading: {
        color: '#4C1D95',
        textAlign: 'center',
        marginTop: 10,
        fontWeight: '600',
    },

    error: {
        color: '#C4123E',
        textAlign: 'center',
        fontWeight: '600',
    },
});

export default App;