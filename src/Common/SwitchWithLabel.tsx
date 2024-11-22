import {View, Text, Switch, StyleSheet} from 'react-native';
import React from 'react';

// Define types for the component props
interface SwitchWithLabelsProps {
  label: string;
  isEnabled: boolean;
  onToggleSwitch: (value: boolean) => void;
}

const SwitchWithLabels: React.FC<SwitchWithLabelsProps> = ({
  label,
  isEnabled,
  onToggleSwitch,
}) => {
  return (
    <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
      <View style={styles.switchContainer}>
        <Switch
          value={isEnabled}
          onValueChange={onToggleSwitch}
          trackColor={{false: '#FFFFF', true: '#000000'}}
          thumbColor={isEnabled ? '#FFFFFF' : '#00000'}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    width:'100%',
  },
  label: {
    fontSize: 17,
    marginBottom: 10,
    color: 'black',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 8,
  },
});

export default SwitchWithLabels;
