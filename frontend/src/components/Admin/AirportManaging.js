import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AirportManaging = () => {
    const [airportCode, setAirportCode] = useState('');
    const [cityID, setCityID] = useState('');
    const [airportName, setAirportName] = useState('');
    const [airports, setAirports] = useState([]);
    const [selectedAirport, setSelectedAirport] = useState(null);

    // 获取所有机场信息
    const fetchAirports = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/airports`);
            setAirports(response.data);
        } catch (error) {
            console.error('获取机场信息失败', error);
        }
    };

    useEffect(() => {
        fetchAirports();
    }, []);

    // 添加机场信息
    const handleAddAirport = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/admin/manage-airport`, {
                AirportCode: airportCode,
                CityID: cityID,
                Name: airportName
            });
            alert('机场添加成功');
            fetchAirports();
            setAirportCode('');
            setCityID('');
            setAirportName('');
        } catch (error) {
            console.error('机场添加失败', error);
        }
    };

    // 删除机场信息
    const handleDeleteAirport = async (AirportCode) => {
        if (window.confirm('确定要删除这个机场吗？')) {
            try {
                await axios.delete(`${process.env.REACT_APP_API_URL}/api/admin/manage-airport/${AirportCode}`);
                alert('机场删除成功');
                fetchAirports();
            } catch (error) {
                console.error('机场删除失败', error);
            }
        }
    };

    // 编辑机场信息
    const handleEditAirport = (airport) => {
        setSelectedAirport(airport);
        setAirportCode(airport.AirportCode);
        setCityID(airport.CityID);
        setAirportName(airport.Name);
    };

    // 更新机场信息
    const handleUpdateAirport = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/api/admin/manage-airport/${selectedAirport.AirportCode}`, {
                CityID: cityID,
                Name: airportName
            });
            alert('机场信息更新成功');
            fetchAirports();
            setSelectedAirport(null);
            setAirportCode('');
            setCityID('');
            setAirportName('');
        } catch (error) {
            console.error('机场信息更新失败', error);
        }
    };

    return (
        <div>
            <h2>机场管理</h2>
            <form onSubmit={selectedAirport ? handleUpdateAirport : handleAddAirport}>
                <input
                    type="text"
                    placeholder="机场代码"
                    value={airportCode}
                    onChange={(e) => setAirportCode(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="城市 ID"
                    value={cityID}
                    onChange={(e) => setCityID(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="机场名称"
                    value={airportName}
                    onChange={(e) => setAirportName(e.target.value)}
                />
                <button type="submit">{selectedAirport ? '更新机场' : '添加机场'}</button>
                {selectedAirport && (
                    <button type="button" onClick={() => setSelectedAirport(null)}>
                        取消编辑
                    </button>
                )}
            </form>
            <table>
                <thead>
                    <tr>
                        <th>机场代码</th>
                        <th>城市 ID</th>
                        <th>机场名称</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    {airports.map((airport) => (
                        <tr key={airport.id}>
                            <td>{airport.AirportCode}</td>
                            <td>{airport.CityID}</td>
                            <td>{airport.Name}</td>
                            <td>
                                <button onClick={() => handleEditAirport(airport)}>编辑</button>
                                <button onClick={() => handleDeleteAirport(airport.AirportCode)}>删除</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AirportManaging;
    