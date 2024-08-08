import {
  createContext,
  useEffect,
  useContext,
  useReducer,
  useCallback,
} from "react";

const Base_URL = "http://localhost:9000";

const CitiesContext = createContext();

function CitiesProvider({ children }) {
  // const [cities, setCities] = useState([]);
  // const [isLoading, setIsLoading] = useState(false);
  // const [currentCity, setCurrentCity] = useState({});
  const initialState = {
    cities: [],
    isLoading: false,
    currentCity: {},
    error: "",
  };

  function reducer(state, action) {
    switch (action.type) {
      case "loading":
        return { ...state, isLoading: true };

      case "cities/loaded":
        return {
          ...state,
          isLoading: false,
          cities: action.payload,
        };
      case "city/loaded":
        return {
          ...state,
          isLoading: false,
          currentCity: action.payload,
        };
      case "city/created":
        return {
          ...state,
          isLoading: false,
          cities: [...state.cities, action.payload],
          currentCity: action.payload,
        };
      case "city/deleted":
        return {
          ...state,
          isLoading: false,
          cities: state.cities.filter((city) => city.id !== action.payload),
          currentCity: {},
        };

      case "rejected":
        return {
          ...state,
          isLoading: false,
          error: action.payload,
        };

      default:
        throw new Error("Unknown action type");
    }
  }

  const [{ cities, isLoading, currentCity, error }, dispatch] = useReducer(
    reducer,
    initialState
  );

  useEffect(function () {
    async function fetchCities() {
      dispatch({ type: "loading" });
      try {
        // setIsLoading(true);
        const data = await fetch(`${Base_URL}/cities`);
        const res = await data.json();
        dispatch({ type: "cities/loaded", payload: res });
        // setCities(res);
      } catch {
        //console.log("There was an problem in data loading");
        dispatch({
          type: "rejected",
          payload: "There was an error in cities loading..",
        });
      }
    }
    fetchCities();
  }, []);

  const fetchCity = useCallback(
    async function fetchCity(id) {
      // console.log(id, currentCity.id);

      if (Number(id) === currentCity.id) return;
      dispatch({ type: "loading" });
      try {
        //setIsLoading(true);
        const data = await fetch(`${Base_URL}/cities/${id}`);
        const res = await data.json();
        dispatch({ type: "city/loaded", payload: res });
        //setCurrentCity(res);
      } catch {
        dispatch({
          type: "rejected",
          payload: "There was an error in city loading..",
        });
        //console.log("There was an problem in data loading");
      }
    },
    [currentCity.id]
  );
  async function createCity(newCity) {
    dispatch({ type: "loading" });
    try {
      //setIsLoading(true);
      const data = await fetch(`${Base_URL}/cities`, {
        method: "POST",
        body: JSON.stringify(newCity),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const res = await data.json();
      dispatch({ type: "city/created", payload: res });
      //setCities((cities) => [...cities, res]);
      //console.log(res);
    } catch {
      dispatch({
        type: "rejected",
        payload: "There was an error in creating city..",
      });
      //console.log("There was an error in creating the city");
    }
  }

  async function deleteCity(id) {
    dispatch({ type: "loading" });
    try {
      // setIsLoading(true);
      await fetch(`${Base_URL}/cities/${id}`, {
        method: "DELETE",
      });
      dispatch({ type: "city/deleted", payload: id });
      //setCities((cities) => cities.filter((city) => city.id !== id));
      //console.log(res);
    } catch {
      //console.log("There was an error in deleting the city");
      dispatch({
        type: "rejected",
        payload: "There was an error in deleting city..",
      });
    }
  }

  return (
    <CitiesContext.Provider
      value={{
        cities,
        isLoading,
        currentCity,
        error,
        fetchCity,
        createCity,
        deleteCity,
      }}
    >
      {children}
    </CitiesContext.Provider>
  );
}

function useCities() {
  const context = useContext(CitiesContext);
  if (context === undefined)
    throw new Error("CitiesContext was outside the CitiesProvider ");

  return context;
}

export { CitiesProvider, useCities };
