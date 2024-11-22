import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  btnViewStyle: object;
  textStyle: object;
  buttonContainer: object;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  btnViewStyle,
  textStyle,
  buttonContainer,
}) => {
  return (
    <View style={[style.buttonContainer, buttonContainer]}>
      <Pressable onPress={onPress}>
        <View style={[style.containerView, btnViewStyle]}>
          <Text style={[style.title, textStyle]}>{title}</Text>
        </View>
      </Pressable>
    </View>
  );
};

export default CustomButton;

const style = StyleSheet.create({
    buttonContainer: {
        paddingHorizontal:20,
    },
  containerView: {
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
  },
  title: {color: 'white'},
});
