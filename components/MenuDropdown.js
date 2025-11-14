import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { createGlobalStyles } from '../styles/GlobalStyles';

const MenuDropdown = ({ 
  darkMode, 
  currentProfile,
  profiles,
  currentAgeRating,
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
  isGuest,
  onRequestPassword
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileSelector, setShowProfileSelector] = useState(false);
  const globalStyles = createGlobalStyles(darkMode);

  const handleItemPress = (item) => {
    if (item.isProfile) {
      setIsOpen(false);
      setTimeout(() => setShowProfileSelector(true), 100);
      return;
    }
    
    setIsOpen(false);
    
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
    { 
      label: `👤 Profile: ${isSubscribed && currentProfile ? currentProfile.name : 'Global'} ${!isSubscribed ? '🔒' : ''}`, 
      onPress: isSubscribed ? () => {} : onUpgrade, 
      isProfile: isSubscribed,
      available: true
    },
    { 
      label: `  👶 Age: ${currentAgeRating || 'Children'}`, 
      onPress: isGuest ? onUpgrade : onAgePress, 
      available: !isGuest,
      isSubmenu: true
    },
    { 
      label: '  📝 Words', 
      onPress: isSubscribed ? onWordsPress : onUpgrade, 
      requiresPremium: true,
      available: isSubscribed,
      isSubmenu: true
    },
    { 
      label: '  💾 Saved Stories', 
      onPress: isSubscribed ? onSavedStoriesPress : onUpgrade, 
      requiresPremium: true,
      available: isSubscribed,
      isSubmenu: true
    },
    { 
      label: '👥 Manage Profiles', 
      onPress: isSubscribed ? onProfilesPress : onUpgrade, 
      available: isSubscribed
    },
    { 
      label: '🎧 Support', 
      onPress: isSubscribed ? onSupportPress : onUpgrade, 
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
    <View style={globalStyles.menuContainer}>
      <TouchableOpacity 
        style={globalStyles.menuButton} 
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text style={globalStyles.menuIcon}>⋮</Text>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity 
          style={globalStyles.overlay} 
          onPress={() => setIsOpen(false)}
        >
          <View style={globalStyles.dropdown}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  globalStyles.menuItem,
                  item.isSubmenu && globalStyles.submenuItem,
                  !item.available && globalStyles.menuItemDisabled
                ]}
                onPress={() => handleItemPress(item)}
              >
                <Text style={[
                  globalStyles.menuItemText,
                  !item.available && globalStyles.menuItemTextDisabled
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
          style={globalStyles.overlay} 
          activeOpacity={1}
          onPress={() => setShowProfileSelector(false)}
        >
          <TouchableOpacity activeOpacity={1}>
            <View style={globalStyles.dropdown}>
              <Text style={globalStyles.menuItemText}>Select Profile:</Text>
              <TouchableOpacity
                style={globalStyles.menuItem}
                onPress={() => {
                  setShowProfileSelector(false);
                  setTimeout(() => {
                    onRequestPassword(() => onProfileChange(null));
                  }, 200);
                }}
              >
                <Text style={globalStyles.menuItemText}>
                  🌐 None (Global Settings)
                </Text>
              </TouchableOpacity>
              {profiles.map((profile) => (
                <TouchableOpacity
                  key={profile.id}
                  style={globalStyles.menuItem}
                  onPress={() => {
                    setShowProfileSelector(false);
                    setTimeout(() => {
                      onRequestPassword(() => onProfileChange(profile));
                    }, 200);
                  }}
                >
                  <Text style={globalStyles.menuItemText}>
                    👤 {profile.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default MenuDropdown;
