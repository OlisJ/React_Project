import { StyleSheet, View, Text, TextInput, Image, FlatList, ActivityIndicator, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import Axios from "axios";
import { useEffect, useState } from "react";

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
                if (res.data && Array.isArray(res.data)) {
                    const transformedData = res.data.map((coin, index) => ({
                        id: coin.id,
                        rank: coin.market_cap_rank || index + 1,
                        name: coin.name,
                        symbol: coin.symbol.toUpperCase(),
                        icon: coin.image,
                        marketCap: coin.market_cap || 0,
                        price: coin.current_price || 0,
                        availableSupply: coin.circulating_supply || 0,
                        volume: coin.total_volume || 0,
                    }));
                    setCrypto(transformedData);
                    setError(null);
                } else {
                    setCrypto([]);
                    setError('No data returned from API');
                }
                setLoading(false);
            } catch ($error) {
                setCrypto([]);
                setError('Failed to fetch data: ' + ($error.message || 'Network error'));
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredCrypto = crypto.filter((val) => val.name.toLowerCase().includes(search.toLowerCase()));

    const topMarketCapCoins = [...crypto].sort((a, b) => b.marketCap - a.marketCap).slice(0, 4);
    const topVolumeCoins = [...crypto].sort((a, b) => b.volume - a.volume).slice(0, 4);
    const totalMarketCap = crypto.reduce((sum, coin) => sum + coin.marketCap, 0);
    const totalVolume = crypto.reduce((sum, coin) => sum + coin.volume, 0);
    const averagePrice = crypto.length ? crypto.reduce((sum, coin) => sum + coin.price, 0) / crypto.length : 0;

    const renderCryptoItem = ({ item }) => (
        <View style={styles.row}>
            <Text style={styles.rankCell}>{item.rank}</Text>
            <View style={styles.nameCell}>
                {item.icon && <Image source={{ uri: item.icon }} style={styles.icon} />}
                <Text style={styles.name}>{item.name}</Text>
            </View>
            <View style={styles.statsCell}>
                <Text style={styles.symbolCell}>{item.symbol}</Text>
                <Text style={styles.cell}>₹{item.price?.toFixed(2) || 'N/A'}</Text>
            </View>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color="#1199fa" />
                <Text style={styles.loadingText}>Loading cryptocurrencies…</Text>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.errorText}>Error: {error}</Text>
                <Text style={styles.errorSubtext}>Check browser console for details.</Text>
            </SafeAreaView>
        );
    }

    if (crypto.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.heroTitle}>All Cryptocurrencies</Text>
                <Text style={styles.emptyText}>No cryptocurrencies found.</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <View style={styles.topSection}>
                    <View style={styles.topRow}>
                        <View>
                            <Text style={styles.brand}>Nautic Crypto</Text>
                            <Text style={styles.tagline}>Dark navy intelligence, live market flow, and deep liquidity visibility.</Text>
                        </View>
                        <View style={styles.liveBadge}>
                            <Text style={styles.liveBadgeText}>LIVE</Text>
                        </View>
                    </View>
                    <View style={styles.navRow}>
                        <TouchableOpacity style={styles.navButton} onPress={() => setActiveScreen('Home')}>
                            <Text style={styles.navItem}>Home</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.navButton} onPress={() => setActiveScreen('Markets')}>
                            <Text style={styles.navItem}>Markets</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.navButton} onPress={() => setActiveScreen('Insights')}>
                            <Text style={styles.navItem}>Insights</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.heroSection}>
                    <View style={styles.heroBadge}>
                        <Text style={styles.heroBadgeText}>Live market pulse</Text>
                    </View>
                    <Text style={styles.heroTitle}>All Cryptocurrencies</Text>
                    <Text style={styles.heroSubtitle}>A modern dashboard to explore price action, market depth, and sentiment.</Text>
                </View>

            {activeScreen === 'Markets' ? (
                <View style={styles.screenContent}>
                    <Text style={styles.screenTitle}>Market Overview</Text>
                    <View style={styles.metricRow}>
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
                            <Text style={styles.insightName}>{coin.name}</Text>
                            <Text style={styles.insightValue}>₹{coin.marketCap.toLocaleString()}</Text>
                        </View>
                    ))}
                    <Text style={styles.sectionTitle}>Top Volume</Text>
                    {topVolumeCoins.map((coin) => (
                        <View key={coin.id} style={styles.insightRow}>
                            <Text style={styles.insightName}>{coin.name}</Text>
                            <Text style={styles.insightValue}>₹{coin.volume.toLocaleString()}</Text>
                        </View>
                    ))}
                    <TouchableOpacity style={styles.primaryButton} onPress={() => setActiveScreen('Home')}>
                        <Text style={styles.primaryText}>Back to Home</Text>
                    </TouchableOpacity>
                </View>
            ) : activeScreen === 'Insights' ? (
                <View style={styles.screenContent}>
                    <Text style={styles.screenTitle}>Insights</Text>
                    <Text style={styles.screenDescription}>Actionable insights gathered from the latest crypto market movements.</Text>
                    <View style={styles.insightCard}>
                        <Text style={styles.insightSubtitle}>Market Health</Text>
                        <Text style={styles.insightText}>Overall market liquidity is strong with a total volume of ₹{totalVolume.toLocaleString()} today.</Text>
                    </View>
                    <View style={styles.insightCard}>
                        <Text style={styles.insightSubtitle}>Average Price</Text>
                        <Text style={styles.insightText}>Average listed coin price is ₹{averagePrice.toFixed(2)}, indicating broad mid-market interest.</Text>
                    </View>
                    <View style={styles.insightCard}>
                        <Text style={styles.insightSubtitle}>Top Performing Sectors</Text>
                        <Text style={styles.insightText}>Large-cap assets are leading volume, with several top-cap coins showing stable demand.</Text>
                    </View>
                    <TouchableOpacity style={styles.primaryButton} onPress={() => setActiveScreen('Home')}>
                        <Text style={styles.primaryText}>Back to Home</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    <View style={styles.summaryRow}>
                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryLabel}>Market Cap</Text>
                            <Text style={styles.summaryValue}>₹{totalMarketCap.toLocaleString()}</Text>
                        </View>
                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryLabel}>24h Volume</Text>
                            <Text style={styles.summaryValue}>₹{totalVolume.toLocaleString()}</Text>
                        </View>
                    </View>
                    <TextInput
                        style={styles.input}
                        placeholder="Search coins"
                        placeholderTextColor="#7a8bb4"
                        onChangeText={setSearch}
                        value={search}
                    />
                    <FlatList
                        data={filteredCrypto}
                        renderItem={renderCryptoItem}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                </>
            )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#080d1b',
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    topSection: {
        backgroundColor: '#081024',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#1f3262',
        padding: 20,
        marginBottom: 20,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    liveBadge: {
        backgroundColor: '#0a1b3a',
        borderRadius: 999,
        borderWidth: 1,
        borderColor: '#174a97',
        paddingHorizontal: 14,
        paddingVertical: 8,
        alignSelf: 'flex-start',
    },
    liveBadgeText: {
        color: '#7cc3ff',
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 0.5,
        fontFamily: 'Inter',
    },
    tagline: {
        color: '#9db5dc',
        fontSize: 14,
        lineHeight: 22,
        marginTop: 8,
        maxWidth: '72%',
        fontFamily: 'Inter',
    },
    brand: {
        fontSize: 18,
        fontWeight: '700',
        color: '#f4f7ff',
        marginBottom: 14,
        fontFamily: 'Inter',
    },
    navRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    navButton: {
        flex: 1,
        backgroundColor: '#151d32',
        borderRadius: 24,
        paddingVertical: 10,
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: '#1f2b44',
    },
    navItem: {
        color: '#e7f2ff',
        fontSize: 15,
        fontWeight: '700',
        textAlign: 'center',
        fontFamily: 'Inter',
    },
    scrollContainer: {
        paddingBottom: 36,
    },
    heroSection: {
        color: '#e7f2ff',
        fontSize: 15,
        fontWeight: '700',
        textAlign: 'center',
        fontFamily: 'Inter',
    },
    heroBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#13254f',
        borderRadius: 999,
        paddingVertical: 6,
        paddingHorizontal: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#1c3b76',
    },
    heroBadgeText: {
        color: '#70c4ff',
        fontSize: 12,
        fontWeight: '700',
        fontFamily: 'Inter',
    },
    screenContent: {
        backgroundColor: '#101d36',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#1e3563',
        padding: 22,
        marginBottom: 20,
    },
    screenTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#ffffff',
        marginBottom: 10,
        fontFamily: 'Inter',
    },
    screenDescription: {
        fontSize: 15,
        lineHeight: 22,
        color: '#a3b1d1',
        marginBottom: 18,
        fontFamily: 'Inter',
    },
    primaryButton: {
        backgroundColor: '#1199fa',
        borderRadius: 18,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 20,
    },
    primaryText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '700',
        fontFamily: 'Inter',
    },
    metricRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 18,
    },
    metricCard: {
        flex: 1,
        backgroundColor: '#151d32',
        borderRadius: 16,
        padding: 16,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#1f2b44',
    },
    metricLabel: {
        color: '#9bb2d5',
        fontSize: 12,
        fontFamily: 'Inter',
        marginBottom: 8,
    },
    metricValue: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '700',
        fontFamily: 'Inter',
    },
    sectionTitle: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 10,
        fontFamily: 'Inter',
    },
    insightRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#1f2b44',
    },
    insightName: {
        color: '#d7e1ff',
        fontSize: 14,
        fontFamily: 'Inter',
    },
    insightValue: {
        color: '#9bb2d5',
        fontSize: 14,
        fontFamily: 'Inter',
    },
    insightCard: {
        backgroundColor: '#151d32',
        borderRadius: 18,
        padding: 18,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#1f2b44',
    },
    insightSubtitle: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 8,
        fontFamily: 'Inter',
    },
    insightText: {
        color: '#a3b1d1',
        fontSize: 14,
        lineHeight: 22,
        fontFamily: 'Inter',
    },
    heroSection: {
        marginBottom: 22,
    },
    heroTitle: {
        fontSize: 42,
        lineHeight: 50,
        fontWeight: '900',
        color: '#ffffff',
        marginBottom: 10,
        fontFamily: 'Inter',
    },
    heroSubtitle: {
        fontSize: 17,
        lineHeight: 26,
        color: '#b9c8ec',
        maxWidth: '90%',
        fontFamily: 'Inter',
    },
    input: {
        backgroundColor: '#122040',
        borderRadius: 20,
        paddingVertical: 16,
        paddingHorizontal: 20,
        color: '#ffffff',
        fontSize: 17,
        fontFamily: 'Inter',
        borderWidth: 1,
        borderColor: '#1d2d52',
        marginBottom: 20,
    },
    listContent: {
        paddingBottom: 28,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 18,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: '#132443',
        borderRadius: 18,
        padding: 18,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#1c375f',
    },
    summaryLabel: {
        color: '#7da4dc',
        fontSize: 12,
        fontFamily: 'Inter',
        marginBottom: 6,
    },
    summaryValue: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '800',
        fontFamily: 'Inter',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#151d32',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#1f2b44',
        padding: 18,
        marginBottom: 12,
    },
    rankCell: {
        flex: 0.7,
        fontSize: 14,
        fontWeight: '700',
        color: '#9bb2d5',
        fontFamily: 'Inter',
    },
    nameCell: {
        flex: 2.2,
        flexDirection: 'row',
        alignItems: 'center',
    },
    symbolCell: {
        flex: 1,
        fontSize: 12,
        fontWeight: '600',
        color: '#c7d8ff',
        fontFamily: 'Inter',
        textTransform: 'uppercase',
    },
    cell: {
        flex: 1,
        fontSize: 12,
        color: '#d7e1ff',
        fontFamily: 'Inter',
        textAlign: 'right',
    },
    icon: {
        width: 32,
        height: 32,
        marginRight: 12,
        borderRadius: 12,
        backgroundColor: '#0f1628',
    },
    name: {
        fontSize: 15,
        fontWeight: '700',
        color: '#ffffff',
        fontFamily: 'Inter',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#9bb2d5',
        fontFamily: 'Inter',
    },
    errorText: {
        fontSize: 16,
        color: '#ff6b6b',
        fontWeight: '700',
        marginTop: 20,
        marginHorizontal: 20,
        textAlign: 'center',
        fontFamily: 'Inter',
    },
    errorSubtext: {
        fontSize: 12,
        color: '#7b8abf',
        marginTop: 8,
        marginHorizontal: 20,
        textAlign: 'center',
        fontFamily: 'Inter',
    },
    emptyText: {
        fontSize: 16,
        color: '#7b8abf',
        textAlign: 'center',
        marginTop: 40,
        fontFamily: 'Inter',
    },
});

export default App;
