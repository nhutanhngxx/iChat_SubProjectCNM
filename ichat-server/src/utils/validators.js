const validators = {
  validatePhone(phone) {
    if (!phone) return false;
    const regex = /^(\+84)[3-9][0-9]{8}$/; // Bắt đầu bằng +84 và theo sau 1 chữ số từ 3 đến 9 và 8 chữ số bất kỳ
    // const regex = /^(0[3-9]\d{8})$/; // Bắt đầu bằng 0 và theo sau là 1 chữ số từ 3 đến 9 và 8 chữ số bất kỳ
    // const regex = /^(0[3-9]\d{8})|(\+84[3-9]\d{8})$/; // Bắt đầu bằng 0 hoặc +84 và theo sau 1 chữ số từ 3 đến 9 và 8 chữ số bất kỳ
    return regex.test(phone.trim());
  },
};

module.exports = validators;
