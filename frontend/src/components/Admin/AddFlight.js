import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Autocomplete, Paper, List, ListItem, ListItemText, IconButton, Divider, Chip, Grid } from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, FlightTakeoff as FlightTakeoffIcon } from '@mui/icons-material';
import { blue } from '@mui/material/colors';

const AddFlight = () => {
    // 状态管理
    const [flightID, setFlightID] = useState('');
    const [aircraftType, setAircraftType] = useState('');
    const [allAirports, setAllAirports] = useState([]); // 所有可用机场的列表
    const [selectedAirport, setSelectedAirport] = useState(null); // Autocomplete中当前选中的机场
    const [selectedDays, setSelectedDays] = useState([]); // 选中的周飞行日
    const [firstClassSeats, setFirstClassSeats] = useState('');
    const [economyClassSeats, setEconomyClassSeats] = useState('');
    const [stops, setStops] = useState([]); // 已添加到航线的机场列表
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // 组件加载时获取所有机场数据
    useEffect(() => {
        const fetchAirports = async () => {
            try {
                // 这个接口需要后端提供，返回所有机场的列表
                // [{ AirportCode: 'PEK', Name: '北京首都国际机场' }, ...]
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/airports`);
                setAllAirports(response.data);
            } catch (error) {
                console.error('获取机场数据失败:', error);
                alert('无法加载机场列表，请稍后重试。');
            }
        };
        fetchAirports();
    }, []);

    const flightDayOptions = [
        'Mon',
        'Tue',
        'Wed',
        'Thu',
        'Fri',
        'Sat',
        'Sun',
    ];

    // 将选中的机场添加到航线列表（stops）
    const handleAddStop = () => {
        if (selectedAirport && !stops.some(stop => stop.AirportCode === selectedAirport.AirportCode)) {
            setStops([...stops, selectedAirport]);
            setSelectedAirport(null); // 添加后重置Autocomplete组件
        } else if (!selectedAirport) {
            alert('请先选择一个机场。');
        } else {
            alert('该机场已在航线中，不能重复添加。');
        }
    };

    // 从航线列表中移除一个机场
    const handleRemoveStop = (airportToRemove) => {
        setStops(stops.filter(stop => stop.AirportCode !== airportToRemove.AirportCode));
    };

    // 提交整个表单来创建新航班
    const handleSubmit = async (e) => {
        e.preventDefault();

        // 前端数据验证
        if (!flightID.trim() || !aircraftType.trim()) {
            alert('航班号和机型不能为空。');
            return;
        }
        if (stops.length < 2) {
            alert('航线必须至少包含两个机场（一个起点和一个终点）。');
            return;
        }

        setIsLoading(true);

        // 构造要发送到后端的数据
        const newFlightData = {
            flightID,
            aircraftType,
            FirstClassSeats: parseInt(firstClassSeats, 10) || 0, // 确保是数字
            EconomyClassSeats: parseInt(economyClassSeats, 10) || 0, // 确保是数字
            WeeklyFlightDays: selectedDays.join(', '), // 将选中的周飞行日转换为逗号分隔的字符串
            // 将航线机场列表转换为后端需要的格式，并附上顺序
            stops: stops.map((stop, index) => ({
                airportCode: stop.AirportCode,
                stopOrder: index + 1
            }))
        };

        try {
            // 调用后端创建航班的API
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/admin/flights`, newFlightData);
            // console.log('创建航班数据:', newFlightData);
            if (response.status !== 201) {
                throw new Error(`创建航班失败，${response.statusText}`);
            }
            alert('航班创建成功！');
            navigate(-1); // 创建成功后返回上一页（航班列表页）
        } catch (error) {
            console.error('创建航班失败:', error);
            // 显示更友好的错误信息
            const errorMessage = error?.response?.data['error'] || '网络错误或服务器异常，请稍后重试。';
            alert(`${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3, maxWidth: 1000, margin: 'auto' }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FlightTakeoffIcon /> 新增航班计划
                </Typography>
                <Divider sx={{ my: 2 }} />

                <Box component="form" onSubmit={handleSubmit}>
                    {/* 第一步：填写基本信息 */}
                    <Typography variant="h6" gutterBottom>1. 航班基本信息</Typography>
                    <TextField
                        label="航班号 (例如: CA123)"
                        value={flightID}
                        onChange={(e) => setFlightID(e.target.value.toUpperCase())}
                        margin="normal"
                        fullWidth
                        required
                    />
                    <TextField
                        label="机型 (例如: Boeing 737)"
                        value={aircraftType}
                        onChange={(e) => setAircraftType(e.target.value)}
                        margin="normal"
                        fullWidth
                        required
                    />
                    <Autocomplete
                        multiple
                        id='flight-days-autocomplete'
                        options={flightDayOptions}
                        getOptionLabel={(option) => option}
                        value={selectedDays}
                        onChange={(event, newValue) => {
                            console.log('Selected days:', newValue);
                            setSelectedDays(newValue); // Update the state when selection changes
                        }}
                        renderInput = {(params) => (
                            <TextField
                                {...params}
                                label="周飞行日 (例如: Mon,Tue,Wed)"
                                placeholder="选择飞行日"
                                margin="normal"
                                fullWidth
                                // required
                            />
                        )}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                            <Chip
                                label={option}
                                {...getTagProps({ index })}
                                // 使用 sx prop 设置背景颜色和文本颜色
                                sx={{
                                backgroundColor: blue[600], // 将背景色改为蓝色
                                color: 'white',        // 将文本颜色改为白色以便对比
                                '& .MuiChip-deleteIcon': { // 如果你希望删除图标也有不同颜色
                                    color: 'white',
                                },
                                }}
                            />
                            ))
                        }
                    />
                    <Typography variant="h6" gutterBottom style={{ marginTop: '20px' }}>2. 舱位设置</Typography>
                    <Grid container spacing={2}> {/* Use Grid container for layout */}
                        <Grid item xs={12} sm={6}> {/* Occupies 6 columns on small screens and up, 12 on extra small */}
                            <TextField
                                label="头等舱座位数"
                                type="number" // Ensures only numbers can be entered
                                value={firstClassSeats}
                                onChange={(e) => setFirstClassSeats(e.target.value)}
                                margin="normal"
                                fullWidth
                                required
                                inputProps={{ min: 0 }} // Ensures non-negative numbers
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}> {/* Occupies 6 columns on small screens and up, 12 on extra small */}
                            <TextField
                                label="经济舱座位数"
                                type="number" // Ensures only numbers can be entered
                                value={economyClassSeats}
                                onChange={(e) => setEconomyClassSeats(e.target.value)}
                                margin="normal"
                                fullWidth
                                required
                                inputProps={{ min: 0 }} // Ensures non-negative numbers
                            />
                        </Grid>
                    </Grid>

                    {/* 第二步：规划航线 */}
                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>3. 规划航线</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Autocomplete
                            sx={{ flexGrow: 1 }}
                            options={allAirports}
                            getOptionLabel={(option) => `${option.Name} (${option.AirportCode})`}
                            isOptionEqualToValue={(option, value) => option.AirportCode === value.AirportCode}
                            value={selectedAirport}
                            onChange={(event, newValue) => {
                                setSelectedAirport(newValue);
                            }}
                            renderInput={(params) => <TextField {...params} label="搜索并选择机场" />}
                        />
                        <Button
                            variant="contained"
                            onClick={handleAddStop}
                            startIcon={<AddIcon />}
                            sx={{ height: '56px' }}
                        >
                            添加
                        </Button>
                    </Box>

                    {/* 显示当前航线 */}
                    <Typography variant="subtitle1" sx={{ mt: 2 }}>当前航线:</Typography>
                    {stops.length > 0 ? (
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <List>
                                {stops.map((stop, index) => (
                                    <React.Fragment key={stop.AirportCode}>
                                        <ListItem
                                            secondaryAction={
                                                <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveStop(stop)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            }
                                        >
                                            <Chip label={`第 ${index + 1} 站`} color="primary" sx={{ mr: 2 }} />
                                            <ListItemText primary={stop.Name} secondary={stop.AirportCode} />
                                        </ListItem>
                                        {index < stops.length - 1 && <Divider component="li" />}
                                    </React.Fragment>
                                ))}
                            </List>
                        </Paper>
                    ) : (
                        <Typography color="text.secondary" sx={{ml: 1}}>请至少添加两个机场来定义一条航线。</Typography>
                    )}


                    {/* 提交按钮 */}
                    <Box sx={{ mt: 4, textAlign: 'right' }}>
                        <Button
                            variant="outlined"
                            onClick={() => navigate(-1)}
                            sx={{ mr: 2 }}
                            disabled={isLoading}
                        >
                            取消
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={isLoading || stops.length < 2}
                        >
                            {isLoading ? '正在创建...' : '确认并创建航班'}
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default AddFlight;