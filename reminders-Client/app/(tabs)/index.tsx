import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, TextInput, Platform } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

type Reminder = {
  id: number;
  name: string;
  description: string;
  date: string;
};

const serverUrl = 'http://<your-ip-address>:3000/reminders';

export default function Index() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [newReminderName, setNewReminderName] = useState<string>('');
  const [newReminderDescription, setNewReminderDescription] = useState<string>('');
  const [date, setDate] = useState<Date>(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState<boolean>(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState<boolean>(false);

  useEffect(() => {
    fetch(serverUrl)
      .then(response => response.json())
      .then((data: Reminder[]) => {
        console.log('Fetched data:', data);
        setReminders(data);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const addReminder = () => {
    console.log('Adding reminder:', newReminderName, newReminderDescription, date);
    fetch(serverUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: newReminderName, description: newReminderDescription, date: date.toISOString() }),
    })
    .then(response => response.json())
    .then((data: Reminder) => {
      console.log('Added reminder:', data);
      setReminders((prevReminders) => [...prevReminders, data]);
      setNewReminderName('');
      setNewReminderDescription('');
      setDate(new Date());
    })
    .catch(error => console.error('Error adding reminder:', error));
  };

  const handleConfirmDate = (selectedDate: Date) => {
    setDatePickerVisibility(false);
    setDate(selectedDate);
    console.log('Selected Date:', selectedDate);
  };

  const handleConfirmTime = (selectedTime: Date) => {
    setTimePickerVisibility(false);
    const newDate = new Date(date);
    newDate.setHours(selectedTime.getHours());
    newDate.setMinutes(selectedTime.getMinutes());
    setDate(newDate);
    console.log('Selected Time:', selectedTime);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Personal Reminders</Text>
      <TextInput
        style={styles.input}
        placeholder="Reminder Name"
        value={newReminderName}
        onChangeText={setNewReminderName}
      />
      <TextInput
        style={styles.input}
        placeholder="Reminder Description"
        value={newReminderDescription}
        onChangeText={setNewReminderDescription}
      />
      {Platform.OS === 'web' ? (
        <>
          <input
            type="date"
            onChange={(e) => setDate(new Date(e.target.value))}
            style={styles.input}
          />
          <input
            type="time"
            onChange={(e) => {
              const time = e.target.value.split(':');
              const newDate = new Date(date);
              newDate.setHours(parseInt(time[0], 10));
              newDate.setMinutes(parseInt(time[1], 10));
              setDate(newDate);
            }}
            style={styles.input}
          />
        </>
      ) : (
        <>
          <Pressable style={styles.button} onPress={() => setDatePickerVisibility(true)}>
            <Text style={styles.buttonText}>Select Date</Text>
          </Pressable>
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleConfirmDate}
            onCancel={() => setDatePickerVisibility(false)}
          />
          <Pressable style={styles.button} onPress={() => setTimePickerVisibility(true)}>
            <Text style={styles.buttonText}>Select Time</Text>
          </Pressable>
          <DateTimePickerModal
            isVisible={isTimePickerVisible}
            mode="time"
            onConfirm={handleConfirmTime}
            onCancel={() => setTimePickerVisibility(false)}
          />
        </>
      )}
      <Text>Selected Date: {date.toLocaleDateString()}</Text>
      <Text>Selected Time: {date.toLocaleTimeString()}</Text>
      <Pressable style={styles.button} onPress={addReminder}>
        <Text style={styles.buttonText}>Add Reminder</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
    width: '80%',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
    width: '80%',
  },
  buttonText: {
    color: '#fff',
  },
});
