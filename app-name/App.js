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

    const filteredCrypto = crypto.filter((val) =>
        val.name.toLowerCase().includes(search.toLowerCase())
    );

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
                <Text style={styles.price}>₹{item.price.toFixed(2)}</Text>
            </View>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color="#00ffcc" />
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
                <View style={styles.titleBar}>
                    <Text style={styles.mainTitle}>Market Flux</Text>
                    <Text style={styles.subtitle}>Real-time crypto intelligence</Text>
                </View>

                <View style={styles.selectorBar}>
                    <BlurView intensity={40} tint="dark" style={styles.selectorBlur}>
                        <View style={styles.selector}>
                            <TouchableOpacity 
                                onPress={() => setActiveScreen('Home')}
                                style={styles.selectorTab}
                            >
                                <View style={[styles.selectorIndicator, activeScreen === 'Home' && styles.activeIndicator]} />
                                <Text style={[styles.selectorText, activeScreen === 'Home' && styles.selectorTextActive]}>
                                    {activeScreen === 'Home' ? '◆' : '○'} Home
                                </Text>
                            </TouchableOpacity>

                            <View style={styles.divider} />

                            <TouchableOpacity 
                                onPress={() => setActiveScreen('Markets')}
                                style={styles.selectorTab}
                            >
                                <View style={[styles.selectorIndicator, activeScreen === 'Markets' && styles.activeIndicator]} />
                                <Text style={[styles.selectorText, activeScreen === 'Markets' && styles.selectorTextActive]}>
                                    {activeScreen === 'Markets' ? '◆' : '○'} Markets
                                </Text>
                            </TouchableOpacity>

                            <View style={styles.divider} />

                            <TouchableOpacity 
                                onPress={() => setActiveScreen('Insights')}
                                style={styles.selectorTab}
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

                        <TextInput
                            style={styles.search}
                            placeholder="Search coin..."
                            placeholderTextColor="#777"
                            value={search}
                            onChangeText={setSearch}
                        />

                        <View style={styles.statsRow}>
                            <View style={styles.statCard}>
                                <Text style={styles.statLabel}>Market Cap</Text>
                                <Text style={styles.statValue}>
                                    ₹{totalMarketCap.toLocaleString()}
                                </Text>
                            </View>

                            <View style={styles.statCard}>
                                <Text style={styles.statLabel}>Volume</Text>
                                <Text style={styles.statValue}>
                                    ₹{totalVolume.toLocaleString()}
                                </Text>
                            </View>
                        </View>

                        <FlatList
                            data={filteredCrypto}
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
                                <Text style={styles.metricValue}>₹{totalMarketCap.toLocaleString()}</Text>
                            </View>
                            <View style={styles.metricCard}>
                                <Text style={styles.metricLabel}>24h Volume</Text>
                                <Text style={styles.metricValue}>₹{totalVolume.toLocaleString()}</Text>
                            </View>
                        </View>

                        <Text style={styles.sectionTitle}>Top Market Cap</Text>
                        {topMarketCapCoins.map((coin) => (
                            <View key={coin.id} style={styles.insightRow}>
                                <View style={styles.coinRow}>
                                    {coin.icon && <Image source={{ uri: coin.icon }} style={styles.smallIcon} />}
                                    <Text style={styles.insightName}>{coin.name}</Text>
                                </View>
                                <Text style={styles.insightValue}>₹{coin.marketCap.toLocaleString()}</Text>
                            </View>
                        ))}

                        <Text style={styles.sectionTitle}>Top Volume</Text>
                        {topVolumeCoins.map((coin) => (
                            <View key={coin.id} style={styles.insightRow}>
                                <View style={styles.coinRow}>
                                    {coin.icon && <Image source={{ uri: coin.icon }} style={styles.smallIcon} />}
                                    <Text style={styles.insightName}>{coin.name}</Text>
                                </View>
                                <Text style={styles.insightValue}>₹{coin.volume.toLocaleString()}</Text>
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
                                Overall market liquidity is strong with a total volume of ₹{totalVolume.toLocaleString()} today. This indicates robust trading activity across all major coins.
                            </Text>
                        </View>

                        <View style={styles.insightCard}>
                            <Text style={styles.insightCardTitle}>Average Price</Text>
                            <Text style={styles.insightCardText}>
                                Average listed coin price is ₹{averagePrice.toFixed(2)}, indicating broad mid-market interest and diverse investment opportunities.
                            </Text>
                        </View>

                        <View style={styles.insightCard}>
                            <Text style={styles.insightCardTitle}>Top Performing Sectors</Text>
                            <Text style={styles.insightCardText}>
                                Large-cap assets are leading volume, with several top-cap coins showing stable demand. Market stability is at healthy levels.
                            </Text>
                        </View>

                        <View style={styles.insightCard}>
                            <Text style={styles.insightCardTitle}>Market Trend</Text>
                            <Text style={styles.insightCardText}>
                                The cryptocurrency market continues to show strong fundamentals with consistent trading patterns. Monitor key resistance levels for trading opportunities.
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
        backgroundColor: '#05070f',
        paddingHorizontal: 16,
    },

    scrollContent: {
        paddingBottom: 30,
    },

    /* NEW CREATIVE HEADER */
    headerSection: {
        marginVertical: 12,
        marginBottom: 24,
    },

    titleBar: {
        marginBottom: 16,
    },

    mainTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: -0.5,
    },

    subtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.6)',
        marginTop: 4,
        fontWeight: '500',
    },

    selectorBar: {
        borderRadius: 14,
        overflow: 'hidden',
    },

    selectorBlur: {
        paddingVertical: 8,
        paddingHorizontal: 8,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },

    selector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },

    selectorTab: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },

    selectorIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },

    activeIndicator: {
        backgroundColor: '#00ffcc',
        width: 6,
        height: 6,
    },

    selectorText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 13,
        fontWeight: '600',
    },

    selectorTextActive: {
        color: '#00ffcc',
        fontWeight: '700',
    },

    divider: {
        width: 1,
        height: 18,
        backgroundColor: 'rgba(255,255,255,0.06)',
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
        color: '#fff',
        fontWeight: '800',
        marginBottom: 10,
    },

    search: {
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 14,
        padding: 12,
        color: '#fff',
        marginBottom: 16,
    },

    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },

    statCard: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 14,
        borderRadius: 14,
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },

    statLabel: {
        color: '#aaa',
        fontSize: 12,
    },

    statValue: {
        color: '#fff',
        fontWeight: '700',
        marginTop: 6,
    },

    /* LIST */
    card: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 14,
        marginBottom: 10,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },

    rank: {
        color: '#aaa',
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
        color: '#fff',
        fontWeight: '600',
    },

    rightInfo: {
        alignItems: 'flex-end',
    },

    symbol: {
        color: '#aaa',
        fontSize: 12,
    },

    price: {
        color: '#fff',
        fontWeight: '700',
    },

    /* OTHER SCREENS */
    screenTitle: {
        fontSize: 28,
        color: '#fff',
        fontWeight: '800',
        marginBottom: 20,
        marginTop: 10,
    },

    sectionTitle: {
        fontSize: 16,
        color: '#fff',
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
        backgroundColor: 'rgba(0,255,204,0.08)',
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,255,204,0.15)',
    },

    metricLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 8,
    },

    metricValue: {
        color: '#00ffcc',
        fontSize: 16,
        fontWeight: '800',
    },

    insightRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
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
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },

    insightValue: {
        color: '#00ffcc',
        fontWeight: '700',
        fontSize: 14,
    },

    insightCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },

    insightCardTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 8,
    },

    insightCardText: {
        color: 'rgba(255,255,255,0.75)',
        fontSize: 14,
        lineHeight: 22,
    },

    screen: {
        padding: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        marginTop: 10,
    },

    screenText: {
        color: '#ccc',
        marginTop: 6,
    },

    loading: {
        color: '#fff',
        textAlign: 'center',
        marginTop: 10,
    },

    error: {
        color: 'red',
        textAlign: 'center',
    },
});

export default App;