import React, { useEffect, useState } from 'react'
import CardItem from '../card/CardItem'
import { useParams } from 'react-router-dom'
import { getItemById } from '../../service/apiServise';

function SearchPage() {
    const {id} = useParams();
   const [items, setItems] = useState([]); 
   const [error, setError] = useState("");

    const getItemByName = async () => {
try {
        const data = await getItemById(id);
setItems(data);
    }
catch (error) {
    console.log(error);
    if (error.response?.status === 400 || error.response?.status === 500) {
        setError(error.response.data);
    }
}
    }
    useEffect(() => {
        getItemByName();
    }, [useParams()]);
  return (
    <div>
       {items ? <h1>תוצאות חיפוש</h1> : <h1>לא נמצאו תוצאות</h1>}
       
         <div key={items.id}>
            <CardItem item={items} />
        </div>
    </div>
  )
}

export default SearchPage