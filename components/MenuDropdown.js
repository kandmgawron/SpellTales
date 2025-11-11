import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';

const MenuDropdown = ({ 
  darkMode, 
  currentProfile,
  profiles,
  onProfileChange,
  onProfilesPress,
  onWordsPress, 
  onAgePress, 
  onSavedStoriesPress, 
  onSupportPress,
  onFAQPress,
  onDarkModeToggle, 
  onSignOut,
  onUpgrade,
  isSubscribed,
  isGuest
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileSelector, setShowProfileSelector] = useState(false);
  const styles = getStyles(darkMode);

  const handleItemPress = (item) => {
    setIsOpen(false);
    
    if (item.isProfile) {
      setShowProfileSelector(true);
      return;
    }
    
    // Check if feature is available for current user type
    if (item.requiresPremium && !isSubscribed) {
      onUpgrade();
      return;
    }
    
    if (item.requiresAccount && isGuest) {
      onUpgrade();
      return;
    }
    
    item.onPress();
  };

  const menuItems = [
    ...(profiles.length > 0 ? [{ 
      label: `👤 Profile: ${currentProfile?.name || 'None'}`, 
      onPress: () => {}, 
      isProfile: true,
      available: true
    }] : []),
    { 
      label: '👥 Manage Profiles', 
      onPress: (isSubscribed && !isGuest) ? onProfilesPress : onUpgrade, 
      available: Boolean(isSubscribed && !isGuest)
    },
    { 
      label: '📝 Words', 
      onPress: onWordsPress, 
      requiresPremium: true,
      available: isSubscribed
    },
    { 
      label: '👶 Age Rating', 
      onPress: onAgePress, 
      requiresAccount: true,
      available: !isGuest
    },
    { 
      label: '💾 Saved Stories', 
      onPress: onSavedStoriesPress, 
      requiresPremium: true,
      available: isSubscribed
    },
    { 
      label: '🎧 Support', 
      onPress: onSupportPress, 
      requiresPremium: true,
      available: isSubscribed
    },
    { 
      label: '❓ FAQ', 
      onPress: onFAQPress, 
      available: true
    },
    { 
      label: `${darkMode ? '☀️ Light' : '🌙 Dark'} Mode`, 
      onPress: onDarkModeToggle, 
      available: true
    },
    { 
      label: '🚪 Sign Out', 
      onPress: onSignOut, 
      available: true
    },
  ];

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.menuButton} 
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text style={styles.menuIcon}>⋮</Text>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity 
          style={styles.overlay} 
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.dropdown}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  !item.available && styles.menuItemDisabled
                ]}
                onPress={() => handleItemPress(item)}
              >
                <Text style={[
                  styles.menuItemText,
                  !item.available && styles.menuItemTextDisabled
                ]}>
                  {item.label}
                  {!item.available && ' 🔒'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showProfileSelector}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowProfileSelector(false)}
      >
        <TouchableOpacity 
          style={styles.overlay} 
          onPress={() => setShowProfileSelector(false)}
        >
          <View style={styles.dropdown}>
            <Text style={styles.profileHeader}>Select Profile:</Text>
            <TouchableOpacity
              style={[styles.menuItem, !currentProfile && styles.selectedProfile]}
              onPress={() => {
                onProfileChange(null);
                setShowProfileSelector(false);
              }}
            >
              <Text style={[styles.menuItemText, !currentProfile && styles.selectedProfileText]}>
                🌐 None (Global Settings)
              </Text>
            </TouchableOpacity>
            {profiles.map((profile) => (
              <TouchableOpacity
                key={profile.id}
                style={[styles.menuItem, profile.id === currentProfile?.id && styles.selectedProfile]}
                onPress={() => {
                  onProfileChange(profile);
                  setShowProfileSelector(false);
                }}
              >
                <Text style={[styles.menuItemText, profile.id === currentProfile?.id && styles.selectedProfileText]}>
                  👤 {profile.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const getStyles = (darkMode) => StyleSheet.create({
  container: {
    position: 'relative',
  },
  menuButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: darkMode ? '#4A5568' : '#E2E8F0',
  },
  menuIcon: {
    fontSize: 20,
    color: darkMode ? '#E2E8F0' : '#4A5568',
    fontWeight: 'bold',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 100,
    paddingRight: 20,
  },
  dropdown: {
    backgroundColor: darkMode ? '#2D3748' : '#FFFFFF',
    borderRadius: 8,
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: darkMode ? '#4A5568' : '#E2E8F0',
  },
  menuItemDisabled: {
    opacity: 0.5,
  },
  menuItemText: {
    fontSize: 16,
    color: darkMode ? '#E2E8F0' : '#2D3748',
  },
  menuItemTextDisabled: {
    color: darkMode ? '#6B7280' : '#9CA3AF',
  },
  profileHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: darkMode ? '#E2E8F0' : '#4A5568',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: darkMode ? '#4A5568' : '#E2E8F0',
  },
  selectedProfile: {
    backgroundColor: darkMode ? '#4A5568' : '#E2E8F0',
  },
  selectedProfileText: {
    fontWeight: 'bold',
  },
});

export default MenuDropdown;
