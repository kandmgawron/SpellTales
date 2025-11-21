import React from 'react';
import { View } from 'react-native';
import { BannerAd, BannerAdSize, adMobAvailable, AdService } from '../services/AdService';

export default function BannerAdComponent({ style }) {
  if (!adMobAvailable) {
    return (
      <View style={[{ height: 50, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }, style]}>
        {/* Placeholder for when AdMob is not available */}
      </View>
    );
  }

  return (
    <View style={style}>
      <BannerAd
        unitId={AdService.getBannerAdUnitId()}
        size={BannerAdSize.BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
    </View>
  );
}
