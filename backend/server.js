const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Cho phép Front-end gọi API mà không bị chặn (CORS)
app.use(cors({ origin: '*' }));
app.use(bodyParser.json());

// Cấu hình Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'lehonganthien61633@gmail.com', 
        pass: 'whif vgav uoya puix
' 
    }
});

const otpStore = {};

app.post('/api/send-otp', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Vui lòng cung cấp email.' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = { code: otp, expires: Date.now() + 5 * 60000 };

    try {
        await transporter.sendMail({
            from: '"Hệ Thống Kiểm Toán" <lehonganthien61633@gmail.com>',
            to: email,
            subject: 'Mã xác nhận OTP của bạn',
            text: `Mã xác nhận OTP của bạn là: ${otp}\nMã này có hiệu lực trong vòng 5 phút. Vui lòng không chia sẻ cho người khác.`
        });
        res.json({ success: true, message: 'Đã gửi mã OTP thành công.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Không thể gửi email. Kiểm tra lại cấu hình mật khẩu.' });
    }
});

app.post('/api/verify-otp', (req, res) => {
    const { email, otp } = req.body;
    const record = otpStore[email];

    if (!record) return res.status(400).json({ success: false, message: 'Mã OTP không tồn tại hoặc chưa được gửi.' });
    if (Date.now() > record.expires) {
        delete otpStore[email];
        return res.status(400).json({ success: false, message: 'Mã OTP đã hết hạn.' });
    }
    if (record.code !== otp) return res.status(400).json({ success: false, message: 'Mã OTP không chính xác.' });

    delete otpStore[email];
    res.json({ success: true, message: 'Xác thực OTP thành công.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Backend đang chạy tại cổng ${PORT}`);
});
