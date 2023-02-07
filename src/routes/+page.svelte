<script>
    // Import the functions you need from the SDKs you need
    import { initializeApp } from "firebase/app";

    import {onMount} from "svelte";
    import { getFirestore, collection, getDocs, query, where, limit } from 'firebase/firestore/lite';

    //Run every 0.5 seconds
    let currentTime = new Date();
    setInterval(() => {
        currentTime = new Date();

    }, 500);


    // TODO: Add SDKs for Firebase products that you want to use
    // https://firebase.google.com/docs/web/setup#available-libraries

    // Your web app's Firebase configuration
    // For Firebase JS SDK v7.20.0 and later, measurementId is optional
    const firebaseConfig = {
        apiKey: "AIzaSyB3JAKSM2-JJNZsAJDVUi72uD0RbVSz35s",
        authDomain: "flightinfo-578a5.firebaseapp.com",
        databaseURL: "https://flightinfo-578a5-default-rtdb.firebaseio.com",
        projectId: "flightinfo-578a5",
        storageBucket: "flightinfo-578a5.appspot.com",
        messagingSenderId: "56800720641",
        appId: "1:56800720641:web:bd92eb39cfb63e7938cd00",
        measurementId: "G-6MH9GRP45M"
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    let todaysflights = [];


        const getFlights = async () => {
            let q = query(collection(db, 'departures'), where('Planned', '>=', new Date().setHours(0,0,0,0)), where('Planned', '<=', new Date().setHours(23,59,59,999)),limit(20));
            getDocs(q).then((querySnapshot) => {
                todaysflights = querySnapshot;
            })
                .catch((error) => {
                    console.log('Error getting documents: ', error);
                });
        }

        onMount(() => {
            getFlights();
        })

        setInterval(getFlights, 60000);







</script>


<h1 id="title">
    Departures Ilulissat <br/>{currentTime.toLocaleTimeString([],{hour12:false, hour: '2-digit', minute:'2-digit', second:'2-digit'})}
</h1>
<div class="cardContainer">
{#each todaysflights as flight}

        <span class="card">
            <h1>{flight.Rute}</h1>
            <p>Departure: {flight.DepartureAirport}</p>
            <p>Planned: {flight.Planned.getHours()}:{flight.Planned.getMinutes()}</p>
            <p>Destination: {flight.ArrivalAirport}</p>
            <p>Bus Departure: {flight.Planned.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit',hour12:false})}</p>
            {#if flight.Actual}
                <p>Actual: {flight.Actual}</p>
            {/if}
            {#if flight.Estimated}
                <p>Estimated: {flight.Estimated}</p>
            {/if}
        </span>



{/each}
</div>

<style>

    @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital@0;1&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Arvo&family=Barlow+Condensed:ital@0;1&display=swap');

    #title{
        text-align: center;
        font-family: 'Arvo', serif;
    }
    .cardContainer > *{
        min-width: 300px;
        margin: 0;


    }

    .cardContainer{
        min-height: 80vh;
        min-width: 80vw;
        align-items: center;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
    }
    .card{
        /*shadow effect*/
box-shadow: 0 16px 8px 0 rgba(0,0,0,0.2);
        background: url("https://t3.ftcdn.net/jpg/04/95/22/44/360_F_495224491_wZ1fdpUEJcdZac332hiPiU20C2Z0a8Ak.jpg");
        background-size: cover;
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        padding: 1.5rem;

        margin: 1rem;
        border-radius: 10px;
    }

    .card > *{
        margin: 0.2rem;
        text-align: center;
        font-size: 1vh;
        color: black;
        font-family: 'Arvo', serif;
    }

    h1{
        /*add an underline to the title*/
        text-decoration: underline;
    }
</style>
