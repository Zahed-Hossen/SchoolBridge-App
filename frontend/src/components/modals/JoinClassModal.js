import React from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { COLORS, FONTS } from '../../constants/theme';

const JoinClassModal = ({
  visible,
  onClose,
  onJoin,
  joinCode,
  setJoinCode,
  joinError,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Join a Class</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="Enter Class Code"
            value={joinCode}
            onChangeText={setJoinCode}
            autoCapitalize="characters"
          />
          {joinError ? (
            <Text style={styles.modalError}>{joinError}</Text>
          ) : null}
          <View style={styles.modalButtonRow}>
            <TouchableOpacity style={styles.modalJoinButton} onPress={onJoin}>
              <Text style={styles.modalJoinButtonText}>Join</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={onClose}
            >
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 10,
  },
  modalInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    fontSize: FONTS.sizes.body2,
    color: COLORS.text.primary,
    backgroundColor: 'transparent',
  },
  modalError: {
    color: COLORS.error,
    fontSize: FONTS.sizes.sm,
    marginBottom: 6,
    marginTop: 2,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  modalJoinButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  modalJoinButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalCancelButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#eee',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});

export default JoinClassModal;
