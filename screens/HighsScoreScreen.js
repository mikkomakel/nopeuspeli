import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import axios from 'axios';

const HighScoreScreen = () => {
  // Tilamuuttuja parhaiden pisteiden tallentamiseen
  const [highScores, setHighScores] = useState([]);

  // Ladataan parhaat pisteet, kun komponentti renderöidään
  useEffect(() => {
    fetchHighScores();
  }, []);

  // Hakee parhaat pisteet palvelimelta
  const fetchHighScores = async () => {
    try {
      const response = await axios.get('https://nopeuspeliserveri123-dhg7dqfegngqhhag.canadacentral-01.azurewebsites.net/highscores');
      setHighScores(response.data); // Tallennetaan haetut pisteet tilaan
    } catch (error) {
      console.error('Failed to fetch high scores', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>High Scores</Text>
      <FlatList
        data={highScores} // Lista parhaista pisteistä
        keyExtractor={(item, index) => index.toString()} // Määrittää uniikin avaimen jokaiselle listan itemille
        renderItem={({ item }) => (
          <View style={styles.scoreItem}>
            <Text style={styles.playerText}>{item.player}</Text> {/* Pelaajan nimi */}
            <Text style={styles.scoreText}>{item.score}</Text> {/* Pelaajan pisteet */}
          </View>
        )}
      />
    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  scoreItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 250,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'white',
  },
  playerText: {
    fontSize: 18,
    color: 'white',
  },
  scoreText: {
    fontSize: 18,
    color: 'yellow',
  },
});

export default HighScoreScreen;
