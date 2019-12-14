var express = require("express");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);
server.listen(2109);

var users = {};
io.on("connection", function (socket) {
    socket.on("connected", email => {
        users[email] = socket;
        console.log("connected " + email)
    })
    /* Nhận request Rent từ user => chuyển cho player */
    socket.on("send-request", function (jsonData) {
        console.log(jsonData);
        // io.sockets.emit("send-request", jsonData);
        // socket.broadcast.emit('receive-request', jsonData);
        let receiverEmail = jsonData['ReceiverEmail'];
        let message = jsonData['message']; //message{'Email':'diepgiahan@gmail.com','DisplayName':'Diep Gia Han','TimeToRent':4,'TotalMoney':'350000','message':'choi voi minh nha ban'}
        let receiverSocket = users[receiverEmail];
        if (receiverSocket)
            receiverSocket.emit('receive-request', message)
        else
            socket.emit('receive-request', { "isLogOut": "Player " + PlayerName + " đã không còn sẵn sàng để thuê/ hoặc không còn online." })
    });
    /* Nhận thông báo close */
    socket.on("manual-disconnection", function (email) {
        delete users[email];
    });
    /* Nhận response => Trả lời request rent cho user */
    socket.on("response-receive", function (jsonData) {
        let emailResponse = jsonData['email-response'];
        receiverSocket = users[emailResponse];
        if (receiverSocket)
            receiverSocket.emit('waiting-response', jsonData);
    });

    /* Nhận finish rent từ user => đẩy qua player để update tiền */
    socket.on("finish-rent", function (data) {
        let playerSocket = users[data['Player']];
        if (playerSocket) {
            playerSocket.emit('finish-rent', data);
        }
    })
});