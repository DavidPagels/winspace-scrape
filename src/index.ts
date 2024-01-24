import axios from 'axios';
import * as fs from 'fs/promises';
import * as cheerio from 'cheerio';
import { decode } from 'html-entities';
import * as nodemailer from 'nodemailer';
import config from 'config';

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: config.get('smtp.user'),
        pass: config.get('smtp.pass')
    }
});

const requestNewData = async () => {
    const response = await axios.get('https://www.winspace.cc/product/t1550-frameset/');
    return response.data;
}

const writeFile = async (data) => {
    return fs.writeFile(`./data/ws${new Date().getTime()}.txt`, data);
}

const parseFile = async () => {
    const buf = await fs.readFile('./data/ws1706065579547.txt');
    return buf.toString();
}

const scrape = async () => {
    const response = await requestNewData();
    const selector = cheerio.load(response);
    const rawStatus = selector('[data-product_id=19931]').attr('data-product_variations');
    const jsonStatus = JSON.parse(decode(rawStatus));
    const whiteDisc510 = jsonStatus.find(b => {
        const {attribute_size: size, attribute_color: color, 'attribute_brake-type': brakeType} = b.attributes;
        return size === '510' && color === 'White' && brakeType === 'Disc Brake'
    })
    console.log(whiteDisc510)
    if (whiteDisc510.is_in_stock === true) {
        await transporter.sendMail({
            from: config.get('email.from'),
            to: config.get('email.to'),
            subject: 'Winspace Frame Available',
            text: 'Frame is available!'
        });
    }
}

scrape();