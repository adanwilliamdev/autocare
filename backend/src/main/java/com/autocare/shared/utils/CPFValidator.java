package com.autocare.shared.utils;

public final class CPFValidator {

    private CPFValidator() {
    }

    public static boolean isValid(String cpf) {
        if (cpf == null) {
            return false;
        }

        String digits = cpf.replaceAll("\\D", "");

        if (digits.length() != 11 || digits.chars().allMatch(c -> c == digits.charAt(0))) {
            return false;
        }

        int firstCheckDigit = calculateCheckDigit(digits.substring(0, 9), 10);
        int secondCheckDigit = calculateCheckDigit(digits.substring(0, 9) + firstCheckDigit, 11);

        return digits.equals(digits.substring(0, 9) + firstCheckDigit + secondCheckDigit);
    }

    private static int calculateCheckDigit(String base, int firstWeight) {
        int sum = 0;
        int weight = firstWeight;

        for (char c : base.toCharArray()) {
            sum += Character.getNumericValue(c) * weight;
            weight--;
        }

        int remainder = sum % 11;
        return remainder < 2 ? 0 : 11 - remainder;
    }
}
