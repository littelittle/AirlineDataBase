import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CityManaging = () => {
    const [cityName, setCityName] = useState('');
    const [cities, setCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState(null);

    // 获取所有城市信息
    const fetchCities = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/cities`);
            setCities(response.data);
        } catch (error) {
            console.error('获取城市信息失败', error);
        }
    };

    useEffect(() => {
        fetchCities();
    }, []);

    // 添加城市信息
    const handleAddCity = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/admin/manage-city`, {
                Cityname: cityName
            });
            alert('城市添加成功');
            fetchCities();
            setCityName('');
        } catch (error) {
            console.error('城市添加失败', error);
        }
    };

    // 删除城市信息
    const handleDeleteCity = async (cityId) => {
        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/admin/manage-city/${cityId}`);
            alert('城市删除成功');
            fetchCities();
        } catch (error) {
            console.error('城市删除失败', error);
        }
    };

    // 编辑城市信息
    const handleEditCity = (city) => {
        setSelectedCity(city);
        setCityName(city.Cityname);
    };

    // 更新城市信息
    const handleUpdateCity = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/api/admin/manage-city/${selectedCity}`, {
                Cityname: cityName
            });
            alert('城市信息更新成功');
            fetchCities();
            setSelectedCity(null);
            setCityName('');
        } catch (error) {
            console.error('城市信息更新失败', error);
        }
    };

    return (
        <div>
            <h2>城市管理</h2>
            <form onSubmit={selectedCity ? handleUpdateCity : handleAddCity}>
                <input
                    type="text"
                    placeholder="城市名"
                    value={cityName}
                    onChange={(e) => setCityName(e.target.value)}
                />
                <button type="submit">{selectedCity ? '更新城市' : '添加城市'}</button>
                {selectedCity && (
                    <button type="button" onClick={() => setSelectedCity(null)}>
                        取消编辑
                    </button>
                )}
            </form>
            <table>
                <thead>
                    <tr>
                        <th>城市ID</th>
                        <th>城市名</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    {cities.map((city) => (
                        <tr key={city.CityID}>
                            <td>{city.CityID}</td>
                            <td>{city.CityName}</td>
                            <td>
                                <button onClick={() => handleEditCity(city.CityID)}>编辑</button>
                                <button onClick={() => handleDeleteCity(city.CityID)}>删除</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CityManaging;
    