import { Toast } from 'native-base';
import { AsyncStorage } from 'react-native';

export function formatNumberToMoney(num, type) {
    let tail = type && type != "" ? type : "";
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') + tail;
}

export function englishToVietnamese(text) {
    let result = text;
    switch (result) {
        case "DisplayName": result = "Tên user";
            break;
        case "Email": result = "Email";
            break;
        case "Followers": result = "Người theo dõi";
            break;
        case "Gender": result = "Giới tính";
            break;
        case "PhoneNumber": result = "Số điện thoại";
            break;
        case "Achievements": result = "Thành tích";
            break;
        case "AverageRating": result = "Đánh giá";
            break;
        case "CostPerHour": result = "Số tiền thuê";
            break;
        case "FullDetail": result = "Thông tin";
            break;
        case "Game": result = "Trò chơi";
            break;
        case "HasBeenHired": result = "Số lần được thuê";
            break;
        case "Image": result = "Hình ảnh";
            break;
        case "MaxHourCanRent": result = "Giờ thuê tối đa";
            break;
        case "RankTitle": result = "Rank";
            break;
        case "Reviews": result = "Số người đánh giá";
            break;
        case "Status": result = "Trạng thái";
            break;
        case "TotalRevenue": result = "Tổng tiền nhận được";
            break;
        case "Female": result = "Nữ";
            break;
        case "Male": result = "Nam";
            break;
        case "Nothing": result = "Chưa xác định";
            break;
        case "": result = "Chưa xác định";
            break;
        case "Ready": result = "Sẵn sàng";
            break;
        case "Account already existed": result = "Tài khoản đã tồn tại";
            break;
        case "Incorrect email or password": result = "Email hoặc password sai. Xin bạn kiểm tra lại";
            break;
        case "TotalAddedMoney": result = "Tổng tiền";
            break;
        default: result = text;
            break;
    }

    return result;
}

export function arrayToString(arr) {
    let count = 0;
    let result = "";
    arr.forEach(x => {
        result += x;
        count++;
        if (count < arr.length) {
            result += "\n";
        }
    })
    return result;
}

export function objectToString(obj) {
    let key = Object.keys(obj);
    let value = Object.values(obj);
    let result = "";
    for (let i = 0; i < key.length; i++) {
        let temp = "";
        if (value[i] && parseFloat(value[i]) != "NaN") {
            let check = key[i] == "TotalRevenue" || key[i] == "TotalAddedMoney" || key[i] == "CostPerHour" ? "vnđ" : "";
            temp += formatNumberToMoney(value[i]) + check;
        } else {
            temp = englishToVietnamese(value[i]);
        }
        result += englishToVietnamese(key[i]) + ": " + temp;
        if (i < key.length - 1) {
            result += "\n";
        }
    }
    return result;
}

var _asyncStorage = async (map) => {
    await AsyncStorage.setItem(map[0], map[1].toString());
}
export async function storeData(userJson) {
    await Object.entries(userJson).map(async (x) => {
        if (x[0] == "data" || x[0] == "Player") {
            storeData(x[1]);
        } else {
            await _asyncStorage(x);
        }
    })
};

