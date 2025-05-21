import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";
import { Feather } from "@expo/vector-icons";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const [showInput, setShowInput] = useState(false);

  const TASKS_STORAGE_KEY = "@tasks_key";

  const saveTasksToStorage = async (tasksToSave) => {
    try {
      const jsonValue = JSON.stringify(tasksToSave);
      await AsyncStorage.setItem(TASKS_STORAGE_KEY, jsonValue);
    } catch (e) {
      console.error("Fel vid sparning:", e);
    }
  };

  const loadTasksFromStorage = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
      console.error("Fel vid inläsning:", e);
      return [];
    }
  };

  // Ladda tasks när appen startar
  useEffect(() => {
    loadTasksFromStorage().then((loadedTasks) => {
      setTasks(loadedTasks);
    });
  }, []);

  // Spara tasks varje gång de ändras
  useEffect(() => {
    saveTasksToStorage(tasks);
  }, [tasks]);

  const handleAdd = () => {
    if (!newTask.trim()) return;
    const task = {
      id: Date.now().toString(),
      text: newTask.trim(),
      completed: false,
      date: new Date().toLocaleDateString("en-GB"),
      day: "Today",
      key: Date.now().toString(),
    };
    setTasks([task, ...tasks]);
    setNewTask("");
    setShowInput(false);
  };

  const handleEdit = (id) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, text: editText } : t)));
    setEditId(null);
    setEditText("");
  };

  const handleDelete = (id) => setTasks(tasks.filter((t) => t.id !== id));

  const toggleComplete = (id) =>
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );

  const renderItem = ({ item, drag, isActive }) => (
    <TouchableOpacity
      onLongPress={drag}
      activeOpacity={1}
      style={[
        styles.task,
        item.completed && styles.completed,
        isActive && styles.activeTask,
      ]}
    >
      <TouchableOpacity
        style={[styles.checkbox, item.completed && styles.checkedBox]}
        onPress={() => toggleComplete(item.id)}
      >
        {item.completed && <View style={styles.checkmark} />}
      </TouchableOpacity>

      {editId === item.id ? (
        <TextInput
          value={editText}
          onChangeText={setEditText}
          onSubmitEditing={() => handleEdit(item.id)}
          style={styles.input}
        />
      ) : (
        <Text style={[styles.taskText, item.completed && styles.completedText]}>
          {item.text}
        </Text>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => {
            setEditId(item.id);
            setEditText(item.text);
          }}
        >
          <Feather name="edit-2" size={16} color="#AAAAAA" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Feather name="trash-2" size={16} color="#AAAAAA" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <Text style={styles.title}>To Do List</Text>
          <TouchableOpacity onPress={() => setShowInput(!showInput)}>
            <Text style={styles.addBtn}>Add a task +</Text>
          </TouchableOpacity>
        </View>

        {showInput && (
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={newTask}
              onChangeText={setNewTask}
              placeholder="Enter new task"
            />
            <TouchableOpacity onPress={handleAdd} style={styles.saveBtn}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        )}

        <DraggableFlatList
          data={tasks}
          onDragEnd={({ data }) => setTasks(data)}
          keyExtractor={(item) => item.key}
          renderItem={renderItem}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20, margin: 25 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: { fontSize: 28, fontWeight: "bold", color: "#6B7280" },
  addBtn: { fontSize: 16, color: "#FFA5A5" },
  inputRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#DDD",
    padding: 10,
    borderRadius: 10,
    marginRight: 10,
  },
  saveBtn: {
    backgroundColor: "#FFA5A5",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  saveBtnText: { color: "#fff", fontWeight: "bold" },
  task: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#F5F5F5",
    borderRadius: 15,
    marginBottom: 10,
  },
  activeTask: {
    backgroundColor: "#D3D3D3",
  },
  completed: { backgroundColor: "#EEE" },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#DDD",
    marginRight: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  checkedBox: { backgroundColor: "#DDD" },
  checkmark: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "white",
  },
  taskText: { flex: 1, fontSize: 16, color: "#333" },
  completedText: { textDecorationLine: "line-through", color: "#AAA" },
  actions: { flexDirection: "row", gap: 10 },
});
