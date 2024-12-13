import {
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, isWithinInterval } from "date-fns";
import axios from "axios";
import { ResponsiveContainer } from "recharts";

const App = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [ageFilter, setAgeFilter] = useState(null);
  const [genderFilter, setGenderFilter] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date("2022-10-04"),
    endDate: new Date("2022-10-28"),
  });

  const minDate = new Date("2022-10-04");
  const maxDate = new Date("2022-10-28");

  const transformData = (apiData) => {
    return apiData.map((entry) => ({
      day: entry.day, // API date format: "04-10-2022"
      dateObject: new Date(entry.day.split("-").reverse().join("-")), // Convert to JS Date object
      age: entry.age,
      gender: entry.gender,
      A: entry.A,
      B: entry.B,
      C: entry.C,
      D: entry.D,
      E: entry.E,
      F: entry.F,
    }));
  };

  const getData = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/data/bulk");
      const transformedData = transformData(response.data);
      setData(transformedData);
      setFilteredData(transformedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const applyFilters = () => {
    let filtered = data;

    if (dateRange.startDate && dateRange.endDate) {
      filtered = filtered.filter(
        (item) =>
          item.dateObject >= dateRange.startDate &&
          item.dateObject <= dateRange.endDate
      );
    }

    if (ageFilter) {
      filtered = filtered.filter((item) => item.age === ageFilter);
    }

    if (genderFilter) {
      filtered = filtered.filter((item) => item.gender === genderFilter);
    }

    setFilteredData(filtered);
  };

  return (
    <>
      <div className="p-6 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-700 text-white flex flex-wrap gap-5 font-medium text-lg shadow-lg rounded-lg">
        <div className="flex flex-col">
          <p className="mb-2">Select Date Range</p>
          <Popover>
            <PopoverTrigger asChild>
              <Button className="bg-green-500 hover:bg-green-300 text-white rounded-md px-6 py-2 shadow-md">
                {dateRange.startDate && dateRange.endDate
                  ? `${format(dateRange.startDate, "dd/MM/yyyy")} - ${format(
                    dateRange.endDate,
                    "dd/MM/yyyy"
                  )}`
                  : "Select Date Range"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-4 bg-gray-800 rounded-lg">
              <div className="flex gap-6">
                <div>
                  <p className="font-semibold mb-2 text-white">Start Date</p>
                  <Calendar
                    mode="single"
                    selected={dateRange.startDate}
                    onSelect={(date) =>
                      isWithinInterval(date, { start: minDate, end: maxDate }) &&
                      setDateRange((prev) => ({ ...prev, startDate: date }))
                    }
                    disabled={(date) =>
                      !isWithinInterval(date, { start: minDate, end: maxDate })
                    }
                  />
                </div>
                <div>
                  <p className="font-semibold mb-2 text-white">End Date</p>
                  <Calendar
                    mode="single"
                    selected={dateRange.endDate}
                    onSelect={(date) =>
                      isWithinInterval(date, { start: minDate, end: maxDate }) &&
                      setDateRange((prev) => ({ ...prev, endDate: date }))
                    }
                    disabled={(date) =>
                      !isWithinInterval(date, { start: minDate, end: maxDate })
                    }
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col">
          <p className="mb-2">Filter by Age</p>
          <div className="flex gap-2">
            <Button
              className={`mr-2 ${ageFilter === "15-25" ? "bg-green-500" : "bg-gray-700"
                } text-white rounded-md px-6 py-2 shadow-md`}
              onClick={() => setAgeFilter("15-25")}
            >
              15-25
            </Button>
            <Button
              className={`${ageFilter === ">25" ? "bg-green-500" : "bg-gray-700"
                } text-white rounded-md px-6 py-2 shadow-md`}
              onClick={() => setAgeFilter(">25")}
            >
              Above 25
            </Button>
          </div>
        </div>

        <div className="flex flex-col">
          <p className="mb-2">Filter by Gender</p>
          <div className="flex gap-2">
            <Button
              className={`mr-2 ${genderFilter === "Male" ? "bg-green-500" : "bg-gray-700"
                } text-white rounded-md px-6 py-2 shadow-md`}
              onClick={() => setGenderFilter("Male")}
            >
              Male
            </Button>
            <Button
              className={`${genderFilter === "Female" ? "bg-green-500" : "bg-gray-700"
                } text-white rounded-md px-6 py-2 shadow-md`}
              onClick={() => setGenderFilter("Female")}
            >
              Female
            </Button>
          </div>
        </div>

        <div className="mt-6 pl-40">
          <Button
            className="bg-blue-500 hover:bg-blue-300 text-white rounded-md px-8 py-3 shadow-md"
            onClick={applyFilters}
          >
            Apply Filters
          </Button>
        </div>
      </div>

      <main className="flex flex-wrap gap-2 mt-8 justify-center">
        <Card className="w-[45%] bg-slate-900 shadow-xl rounded-lg">
          <CardHeader>
            <CardTitle className="text-white text-xl">Bar Chart - Horizontal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={500}>
              <BarChart
                layout="vertical"
                data={filteredData}
                margin={{ left: 20 }}
              >
                <XAxis type="number" />
                <YAxis dataKey="day" type="category" />
                <Tooltip />
                <Legend />
                <Bar dataKey="A" fill="#8884d8" />
                <Bar dataKey="B" fill="#82ca9d" />
                <Bar dataKey="C" fill="#ffc658" />
                <Bar dataKey="D" fill="#d0ed57" />
                <Bar dataKey="E" fill="#a4de6c" />
                <Bar dataKey="F" fill="#ff7300" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="w-[50%] bg-slate-900 shadow-xl rounded-lg">
          <CardHeader>
            <CardTitle className="text-white text-xl">Line Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={500}>
              <LineChart
                data={filteredData}
                margin={{ left: 20 }}
              >
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="A" stroke="#8884d8" />
                <Line type="monotone" dataKey="B" stroke="#82ca9d" />
                <Line type="monotone" dataKey="C" stroke="#ffc658" />
                <Line type="monotone" dataKey="D" stroke="#d0ed57" />
                <Line type="monotone" dataKey="E" stroke="#a4de6c" />
                <Line type="monotone" dataKey="F" stroke="#ff7300" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </main>
    </>
  );
};

export default App;
