import React, {useState, useEffect, useCallback} from 'react';
import {StyleSheet, Text, TextInput, View, TextInputProps} from 'react-native';

interface CustomTextInputProps extends TextInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  isRequired?: boolean;
  customError?: string;
}

function CustomTextInput({
  label = 'Branch Name',
  value,
  onChangeText,
  placeholder = 'Branch Name',
  isRequired = true,
  customError,
  ...restProps
}: CustomTextInputProps): React.JSX.Element {
  const [isTouched, setIsTouched] = useState(false);
  const [error, setError] = useState<string | null>();

  const validateInput = useCallback(
    (text: string) => {
      const trimText = text.trim();

      if (isRequired && trimText.length === 0) {
        setError(customError);
      } else {
        setError(null);
      }
    },
    [isRequired, customError],
  );

  useEffect(() => {
    if (isTouched) {
      validateInput(value);
    }
  }, [value, isTouched, validateInput]);

  const handleBlur = () => {
    setIsTouched(true);
    validateInput(value);
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        {isRequired && <Text style={styles.required}>*</Text>}
      </View>
      <TextInput
        autoCapitalize="none"
        keyboardType="default"
        spellCheck={false}
        style={[styles.input, error && styles.inputError]}
        placeholder={placeholder}
        placeholderTextColor="#666"
        value={value}
        onChangeText={onChangeText}
        onBlur={handleBlur}
        {...restProps}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

export default CustomTextInput;

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  required: {
    color: '#ff3333',
    marginLeft: 4,
    fontSize: 16,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#ff3333',
  },
  errorText: {
    color: '#ff3333',
    fontSize: 12,
    marginTop: 4,
  },
});
