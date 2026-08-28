import React, { useEffect, useState } from 'react'
import CardItem from '../card/CardItem'
import { useParams } from 'react-router-dom'
import { getItemById } from '../../service/apiServise';

function SearchPage() {
    const {id} = useParams();
   const [items, setItems] = useState(null);
   const [error, setError] = useState("");

    const getItemByName = async () => {
try {
        const data = await getItemById(id);
setItems(data);
setError("");
    }
catch (error) {
    console.log(error);
    setItems(null);
    if (error.response?.status === 400 || error.response?.status === 500) {
        setError(error.response.data);
    } else {
        setError("לא נמצאו תוצאות");
    }
}
    }
    useEffect(() => {
        getItemByName();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);
  return (
    <div>
       {items?.id ? (
        <>
            <h1>תוצאות חיפוש</h1>
            <div key={items.id}>
                <CardItem item={items} />
            </div>
        </>
       ) : (
        <h1>{error || "לא נמצאו תוצאות"}</h1>
       )}
    </div>
  )
}

export default SearchPage