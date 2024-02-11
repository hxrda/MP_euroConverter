import { useState, useEffect, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, TextInput, Button, Image } from "react-native";
import { Picker } from "@react-native-picker/picker";

export default function App() {
	//States:
	const [inputAmount, setInputAmount] = useState("");
	const [keys, setKeys] = useState([]);
	const [selectedCurrency, setSelectedCurrency] = useState("");
	const [result, setResult] = useState(0);
	const [displayResult, setDisplayResult] = useState("");
	const [conversionRate, setConversionRate] = useState();

	//Variables for fetch calls:
	var myHeaders = new Headers();
	myHeaders.append("apikey", "i5iua4hLcEvTNoVwyp3WQGH1uQACwmM9");

	var requestOptions = {
		method: "GET",
		redirect: "follow",
		headers: myHeaders,
	};

	//Functions:
	/*Convert currency value based on exchange rate*/
	const convert = () => {
		/*Calculate conversion:*/
		const resultValue = parseFloat(conversionRate) * parseFloat(inputAmount);

		/*Round the result to 2 decimal places:*/
		const roundedResult = resultValue.toFixed(2);

		/*Save the result to a state:*/
		setResult(roundedResult);

		/*Create a string representation*/
		const resultString = `${roundedResult} €`;

		/*Save the representation to a string state:*/
		setDisplayResult(resultString);
	};

	/*Populate the picker with Keys (currency codes)*/
	useEffect(() => {
		fetch(`https://api.apilayer.com/exchangerates_data/latest`, requestOptions)
			.then((response) => {
				if (!response.ok)
					console.error("Error in fetching keys: " + response.statusText);
				return response.json();
			})
			.then((data) => {
				console.log("API response: ", data);
				setKeys(Object.keys(data.rates));
			})
			.catch((err) => console.error(err));
	}, []);

	//Test
	console.log(keys);

	/*Fetch the currency exchange rate based on currency code*/
	const fetchCurrencies = () => {
		fetch(
			`https://api.apilayer.com/exchangerates_data/latest?base=${selectedCurrency}`,
			requestOptions
		)
			.then((response) => {
				if (!response.ok)
					throw new Error("Error in fetch: " + response.statusText);
				return response.json();
			})
			.then((data) => {
				setConversionRate(data.rates.EUR);
				convert();
				//setInputAmount("");
			})
			.catch((err) => console.error(err));
	};

	const pickerRef = useRef();

	function open() {
		pickerRef.current.focus();
	}

	function close() {
		pickerRef.current.blur();
	}

	//Rendering:
	return (
		<View style={styles.container}>
			<View>
				<Image
					style={{ width: 250, height: 150 }}
					source={require("./img/eurocoins.png")}
				/>
				<Text style={{ marginLeft: 100, marginBottom: 10 }}>
					{displayResult}
				</Text>
			</View>

			<View style={styles.inputContainer}>
				<TextInput
					style={styles.input}
					placeholder="Type amount"
					value={inputAmount}
					onChangeText={(text) => setInputAmount(text)}
				/>

				<Picker
					style={styles.picker}
					ref={pickerRef}
					mode="dropdown"
					selectedValue={selectedCurrency}
					onValueChange={(itemValue, itemIndex) =>
						setSelectedCurrency(itemValue)
					}
				>
					{keys.map((key) => (
						<Picker.Item key={key} label={key} value={key} />
					))}
				</Picker>
			</View>

			<View>
				<Button title="Convert" onPress={fetchCurrencies} />
			</View>

			<StatusBar style="auto" />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		alignItems: "center",
		justifyContent: "center",
	},
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},
	input: {
		//flex: 2,
		borderBottomWidth: 1,
		marginRight: 10,
	},
	picker: {
		//flex: 1,
		width: 120,
	},
});
