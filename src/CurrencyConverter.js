import React, {useState, useEffect} from 'react'
import axios from 'axios'
import { currency_list } from './currcency';
import { SiConvertio } from 'react-icons/si';
import { TbSwitchHorizontal } from 'react-icons/tb';
import { RiWifiOffLine } from 'react-icons/ri';





function CurrencyConverter() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [exchangeRate, setExchangeRate] = useState(0)
    const [amount, setAmount] = useState(null);
    const [fromCurrency, setFromCurrency] = useState('USD');
    const [toCurrency, setToCurrency] = useState('EUR');
    const [currencySymbol, setCurrencySymbol] = useState("€")
    const [convertedAmount, setConvertedAmount] = useState(0);
    const [currencyCode, setCurrencyCode] = useState([])
    const [list, setList] = useState([])


    useEffect(() => {

        setConvertedAmount(0);

        currency_list.filter((item) => {
            if (item.code === toCurrency){
               return setCurrencySymbol(item.symbol)
            } 
        })

    }, [toCurrency, fromCurrency, amount, isOnline])

    useEffect(() => { 
        fetchExchangeRate()
    }, [toCurrency, fromCurrency])


  const fetchExchangeRate = async () => {
    try {
        const response = await axios.get(`https://exchangerate-api.p.rapidapi.com/rapid/latest/${fromCurrency}`, {
            headers: {
                'X-RapidAPI-Key': process.env.REACT_APP_API_KEY,
                'X-RapidAPI-Host': 'exchangerate-api.p.rapidapi.com'
              }
        });
        setCurrencyCode(Object.keys(response.data.rates))
        setExchangeRate(response.data?.rates[toCurrency])
    } catch (error) {
        console.error(error);
        
    }
  }  

  useEffect(() => {
    setList(currency_list.filter((item) => {
        return currencyCode?.find((c) =>  item.code === c)
    }))
  }, [currencyCode, isOnline])


  useEffect(() => {
    function onlineHandler() {
          setIsOnline(true);
    }

    function offlineHandler() {
          setIsOnline(false);
    }

    window.addEventListener("online", onlineHandler);
    window.addEventListener("offline", offlineHandler);

    return () => {
          window.removeEventListener("online", onlineHandler);
          window.removeEventListener("offline", offlineHandler);
    };
  }, []);
  

  const convertCurrency = () => {
     if (!amount || amount === '0') {return}

    const convertedValue = amount * exchangeRate;

    if(Number.isInteger(convertedValue)){
        setConvertedAmount(convertedValue.toLocaleString("en-US", {minimumFractionDigits:2, maximumFractionDigits:2}));
        return
    }
   
    let numDecimal = convertedValue.toString().match(/(\.0*)/)[0].length - 1
    if(numDecimal === 0){
        setConvertedAmount(convertedValue.toLocaleString("en-US", {minimumFractionDigits:2, maximumFractionDigits:2}));
    }else if(numDecimal === 1){
        setConvertedAmount(convertedValue.toLocaleString("en-US", {minimumFractionDigits:2, maximumFractionDigits:2}));
    }else{
        setConvertedAmount(convertedValue.toLocaleString("en-US", {minimumFractionDigits:2, maximumFractionDigits:4}));
    } 
  };



  const swapCurrency = () => {
        setToCurrency(fromCurrency)
        setFromCurrency(toCurrency)
  }
 
  return (
    <div className='full-cont'>
        <div className='header-div'><SiConvertio color='#5ac4a1' size={30}/> <h1>Currency Converter</h1></div>
        
        <div className='container'>
        {isOnline ? 
            <>     
                <div className='cont'>
                    <p className='sm'>Exchange Rate</p>
                    <h1>{currencySymbol} {convertedAmount}</h1>
                </div>

                <div className='amount-cont'>
                    <label>Amount:</label>
                    <input
                    type='number'
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
                </div>

                <div className='main-cont'>
                    <div className='select-cont'>
                        <label>From</label>
                    <select
                        type='text'
                        value={fromCurrency} 
                        onChange={(e) => setFromCurrency(e.target.value)} 
                        >
                        {list?.map((item) => (
                        <option key={item.code} value={item.code} >
                        {item.name}
                        </option>
                        ))}
                    </select>
                    </div>

                    <div className='toggle-btn' onClick={swapCurrency}><TbSwitchHorizontal size={30}/></div>

                    <div className='select-cont'>
                    <label>To</label>
                    <select
                    type='text'
                    value={toCurrency} 
                    onChange={(e) => setToCurrency(e.target.value)} 
                    >
                    {list?.map((item) => (
                    <option key={item.code} value={item.code}>
                    {item.name}
                    </option>
                    ))}
                    </select>
                    </div>

                </div>

                <button  onClick={convertCurrency}>{(!amount || amount === '0') ? 'Enter an amount' : 'Convert'}</button>

            </>            
            :   

            <div className='offline'>
            <RiWifiOffLine size={200}/>
            <p>You are offline. <br/>Please check your internet connection.</p>
            </div>
            }
        </div>
    </div>
  )
}

export default CurrencyConverter