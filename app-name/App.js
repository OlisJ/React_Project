import { StyleSheet, View, Text, TextInput, ScrollView, Image, FlatList, ActivityIndicator, SafeAreaView } from 'react-native';
import Axios from "axios";
import { useEffect, useState } from "react";

function App() {
    // Setting up the initial states using
    // react hook 'useState'
    const [search, setSearch] = useState("");
    const [crypto, setCrypto] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetching crypto data from the API only
    // once when the component is mounted
    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log('Starting API fetch...');
                // Using CoinGecko API instead (free, no auth needed, CORS friendly)
                const res = await Axios.get(
                    'https://api.coingecko.com/api/v3/coins/markets?vs_currency=inr&order=market_cap_desc&per_page=100&page=1&sparkline=false'
                );
                console.log('API Response:', res.data);
                if (res.data && Array.isArray(res.data)) {
                    console.log('Coins data:', res.data.length);
                    // Transform CoinGecko data to match our expected format
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
                    console.log('No coins data in response');
                    setCrypto([]);
                    setError('No data returned from API');
                }
                setLoading(false);
            } catch (error) {
                console.error("Error fetching crypto data:", error.message);
                console.error("Error details:", error);
                setCrypto([]);
                setError('Failed to fetch data: ' + (error.message || 'Network error'));
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredCrypto = crypto.filter((val) => {
        return val.name.toLowerCase().includes(search.toLowerCase());
    });

    const renderCryptoItem = ({ item }) => (
        <View style={styles.row}>
            <Text style={styles.rankCell}>{item.rank}</Text>
            <View style={styles.nameCell}>
                {item.icon && <Image source={{ uri: item.icon }} style={styles.icon} />}
                <Text style={styles.name}>{item.name}</Text>
            </View>
            <Text style={styles.symbolCell}>{item.symbol}</Text>
            <Text style={styles.cell}>₹{item.marketCap?.toLocaleString() || 'N/A'}</Text>
            <Text style={styles.cell}>₹{item.price?.toFixed(2) || 'N/A'}</Text>
            <Text style={styles.cell}>{item.availableSupply?.toLocaleString() || 'N/A'}</Text>
            <Text style={styles.cell}>{item.volume?.toFixed(0) || 'N/A'}</Text>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={styles.loadingText}>Loading cryptocurrencies...</Text>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.errorText}>Error: {error}</Text>
                <Text style={styles.errorSubtext}>Check browser console for details</Text>
            </SafeAreaView>
        );
    }

    if (crypto.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.title}>All Cryptocurrencies</Text>
                <Text style={styles.emptyText}>No cryptocurrencies found</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>All Cryptocurrencies</Text>
            <TextInput
                style={styles.input}
                placeholder="Search..."
                placeholderTextColor="#999"
                onChangeText={setSearch}
                value={search}
            />
            <FlatList
                data={filteredCrypto}
                renderItem={renderCryptoItem}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={true}
                nestedScrollEnabled={true}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginHorizontal: 20,
        marginTop: 16,
        marginBottom: 16,
        color: 'forestgreen',
    },
    input: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginHorizontal: 20,
        marginBottom: 16,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        fontSize: 16,
    },
    row: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#fff',
        marginHorizontal: 4,
        marginVertical: 2,
        borderRadius: 4,
        alignItems: 'center',
    },
    rankCell: {
        flex: 0.8,
        fontSize: 12,
        fontWeight: 'bold',
        textAlignVertical: 'center',
    },
    nameCell: {
        flex: 1.5,
        flexDirection: 'row',
        alignItems: 'center',
    },
    symbolCell: {
        flex: 0.8,
        fontSize: 12,
        fontWeight: '600',
    },
    cell: {
        flex: 1,
        fontSize: 11,
    },
    icon: {
        width: 28,
        height: 28,
        marginRight: 8,
        borderRadius: 14,
    },
    name: {
        fontSize: 12,
        fontWeight: '500',
        flex: 1,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#666',
    },
    errorText: {
        fontSize: 16,
        color: '#d32f2f',
        fontWeight: 'bold',
        marginTop: 20,
        marginHorizontal: 20,
        textAlign: 'center',
    },
    errorSubtext: {
        fontSize: 12,
        color: '#999',
        marginTop: 8,
        marginHorizontal: 20,
        textAlign: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
        marginTop: 40,
    },
});

export default App;