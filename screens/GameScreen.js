import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, TextInput, Alert } from 'react-native';
import axios from 'axios';

// Pelissä käytettävät värit
const colors = ['blue', 'red', 'green', 'orange'];

// Funktio satunnaisen värin valitsemiseksi, varmistaa, ettei sama väri toistu peräkkäin
const getRandomColor = (lastColor) => {
  let newColor;
  do {
    newColor = Math.floor(Math.random() * 4);
  } while (newColor === lastColor);
  return newColor;
};

const GameScreen = () => {
  // Tilamuuttujat
  const [activeButton, setActiveButton] = useState(null); // Nykyinen aktiivinen nappi
  const [sequence, setSequence] = useState([]); // Oikea värijärjestys
  const [userSequence, setUserSequence] = useState([]); // Käyttäjän syöttämä järjestys
  const [score, setScore] = useState(0); // Pelaajan pistemäärä
  const [highScores, setHighScores] = useState([]); // Parhaat pistemäärät
  const [isPlaying, setIsPlaying] = useState(false); // Onko peli käynnissä
  const [speed, setSpeed] = useState(600); // Nopeus (mitä pienempi, sitä nopeammin)
  const [playerName, setPlayerName] = useState(''); // Pelaajan nimi
  const [showInput, setShowInput] = useState(false); // Näytetäänkö nimensyöttökenttä

  // Lataa parhaat pistemäärät, kun komponentti renderöidään
  useEffect(() => {
    loadHighScores();
  }, []);

  // Lisää uusi väri sekvenssiin ja näyttää sen käyttäjälle
useEffect(() => {
  if (isPlaying) {
    const timer = setInterval(() => {
      const newColor = getRandomColor(sequence[sequence.length - 1]); // Valitaan uusi satunnainen väri
      setSequence([...sequence, newColor]);                 // Lisätään uusi väri sekvenssiin
      setActiveButton(newColor);                            // Korostetaan uusi väri hetkellisesti
      setTimeout(() => setActiveButton(null), speed - 200); // Poistetaan korostus 200ms ennen seuraavaa väriä
    }, speed);

    return () => clearInterval(timer); // Pysäytetään ajastin, kun `isPlaying` muuttuu
  }
}, [isPlaying, sequence, speed]);


  // Tarkistaa käyttäjän syöttämän järjestyksen oikeellisuuden
  useEffect(() => {
    if (userSequence.length === sequence.length && userSequence.length > 0) {
      if (userSequence.every((value, index) => value === sequence[index])) {
        setSpeed(Math.max(300, speed - 3)); // Nopeuttaa peliä mutta ei alle 300ms
        setUserSequence([]);                // tyhjennetään käyttäjän syöte
      } else {
        checkIfHighScore(score);          //tarkistetaan kuuluuko top listalle
        resetGame();                      // resetoidaan peli
      }
    }
  }, [userSequence]);

  // Käsittelee käyttäjän painalluksen
  const handleButtonPress = (index) => {
    if (!isPlaying) return;

    setUserSequence([...userSequence, index]);

    if (index === sequence[userSequence.length]) {
      setScore(userSequence.length + 1);
      if (userSequence.length + 1 === sequence.length) {
        setSpeed(Math.max(300, speed - 3));
        setUserSequence([]);
      }
    } else {
      checkIfHighScore(score);
    }
  };

  // Tarkistaa, kuuluuko tulos top 10 -listalle
  const checkIfHighScore = (score) => {
    if (highScores.length < 10 || score > highScores[highScores.length - 1].score) {
      setShowInput(true);
    } else {
      Alert.alert('Game Over!', `Your score: ${score}`);
    }
  };

  // Lähettää korkeimman pisteen palvelimelle
  const submitHighScore = async () => {
    if (!playerName.trim()) {
      Alert.alert('Invalid Name', 'Please enter a valid name.');
      return;
    }

    try {
      await axios.post('https://nopeuspeliserveri123-dhg7dqfegngqhhag.canadacentral-01.azurewebsites.net/highscores', {
        player: playerName,
        score: score,
      });
      setShowInput(false);
      setPlayerName('');
      loadHighScores();
    } catch (error) {
      console.error('Failed to save high score', error.response?.data || error.message);
    }
    resetGame();
  };

  // Lataa parhaat pistemäärät palvelimelta
  const loadHighScores = async () => {
    try {
      const response = await axios.get('https://nopeuspeliserveri123-dhg7dqfegngqhhag.canadacentral-01.azurewebsites.net/highscores');
      setHighScores(response.data);
    } catch (error) {
      console.error('Failed to load high scores', error);
    }
  };

  // Käynnistää pelin uudelleen
  const startGame = () => {
    resetGame();
    setIsPlaying(true);
  };

  // Nollaa pelin tilan
  const resetGame = () => {
    setSequence([]);
    setUserSequence([]);
    setScore(0);
    setSpeed(600);
    setIsPlaying(false);
    setActiveButton(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        {colors.map((color, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.button,
              activeButton === index && styles.activeButton,
              { backgroundColor: color },
            ]}
            onPress={() => handleButtonPress(index)}
          />
        ))}
      </View>
      <TouchableOpacity onPress={startGame} style={styles.startButton}>
        <Text style={styles.startButtonText}>Start Game</Text>
      </TouchableOpacity>
      <Text style={styles.scoreText}>Score: {score}</Text>

      {showInput && (
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Enter your name:</Text>
          <TextInput
            style={styles.input}
            placeholder="Your name"
            value={playerName}
            onChangeText={setPlayerName}
          />
          <TouchableOpacity style={styles.saveButton} onPress={submitHighScore}>
            <Text style={styles.saveButtonText}>Save Score</Text>
          </TouchableOpacity>
        </View>
      )}
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: 90,
    height: 90,
    margin: 5,
    borderRadius: 45,
    backgroundColor: 'white',
  },
  activeButton: {
    opacity: 0.5,
  },
  startButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: 'blue',
    borderRadius: 5,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
  },
  scoreText: {
    marginTop: 20,
    fontSize: 24,
    color: 'white',
  },
  inputContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -50 }],
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    width: 150,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default GameScreen;
