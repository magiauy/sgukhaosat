/**
 * Kiểm tra số điện thoại theo định dạng Việt Nam
 * @param {string} phone - Số điện thoại cần kiểm tra
 * @returns {Object} Kết quả kiểm tra gồm valid và message
 */
export function validatePhoneNumber(phone) {
    // Xóa khoảng trắng, dấu gạch ngang và dấu chấm
    const cleanedPhone = phone.replace(/[\s.-]/g, '');
    
    // Kiểm tra rỗng
    if (!cleanedPhone) {
        return {
            valid: false,
            message: "Vui lòng nhập số điện thoại"
        };
    }
    
    // Kiểm tra chỉ chứa số
    if (!/^\d+$/.test(cleanedPhone)) {
        return {
            valid: false,
            message: "Số điện thoại chỉ được chứa các chữ số"
        };
    }
    
    // Kiểm tra độ dài
    if (cleanedPhone.length < 9 || cleanedPhone.length > 11) {
        return {
            valid: false,
            message: "Số điện thoại phải có 9-11 chữ số"
        };
    }
    
    // Kiểm tra đầu số Việt Nam
    const vnPhoneRegex = /^(0|\+84|84)((3[2-9])|(5[689])|(7[06-9])|(8[1-9])|(9[0-9]))[0-9]{7}$/;
    
    if (!vnPhoneRegex.test(cleanedPhone) && !vnPhoneRegex.test('0' + cleanedPhone)) {
        return {
            valid: false,
            message: "Số điện thoại không đúng định dạng Việt Nam"
        };
    }
    
    return {
        valid: true,
        message: "Số điện thoại hợp lệ"
    };
}

/**
 * Kiểm tra định dạng email
 * @param {string} email - Địa chỉ email cần kiểm tra
 * @returns {Object} Kết quả kiểm tra gồm valid và message
 */
export function validateEmail(email) {
    // Kiểm tra rỗng
    if (!email || email.trim() === '') {
        return {
            valid: false,
            message: "Vui lòng nhập địa chỉ email"
        };
    }
    
    // Kiểm tra độ dài
    if (email.length > 255) {
        return {
            valid: false,
            message: "Email không được vượt quá 255 ký tự"
        };
    }
    
    // Biểu thức chính quy kiểm tra định dạng email
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    
    if (!emailRegex.test(email)) {
        return {
            valid: false,
            message: "Email không đúng định dạng"
        };
    }
    
    // Kiểm tra tên miền phổ biến (tùy chọn)
    const domainParts = email.split('@')[1].split('.');
    const topLevelDomain = domainParts[domainParts.length - 1].toLowerCase();
    
    const validTLDs = ['com', 'net', 'org', 'edu', 'gov', 'mil', 'io', 'co', 'vn', 'info', 'biz', 'me'];
    if (!validTLDs.includes(topLevelDomain) && topLevelDomain.length !== 2) {
        return {
            valid: false,
            message: "Tên miền email không hợp lệ"
        };
    }
    
    return {
        valid: true,
        message: "Email hợp lệ"
    };
}