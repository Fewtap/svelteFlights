<script>
    // Import the functions you need from the SDKs you need
    import { initializeApp } from "firebase/app";

    import {onMount} from "svelte";
    import { getFirestore, collection, getDocs, query, where, limit } from 'firebase/firestore/lite';
    import PocketBase from 'pocketbase';
    import {fade} from 'svelte/transition';

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

    /**
	 * @type {any[]}
	 */
    let todaysflights = [];


        const getflightsfirestore = async () => {
            let q = query(collection(db, 'departures'), where('Planned', '>=', new Date().setHours(0,0,0,0)), where('Planned', '<=', new Date().setHours(23,59,59,999)));
            getDocs(q).then((querySnapshot) => {
                todaysflights = [];
                querySnapshot.forEach((doc) => {
                    let flight = doc.data();
                    if(flight.planned){
                        flight.planned = flight.planned.toDate();
                    }
                    
                    flight.planned = flight.planned.toDate();
                    todaysflights.push(doc.data());
                    console.log(doc.data());
                });
            })
                .catch((error) => {
                    console.log('Error getting documents: ', error);
                });
                
        }

        const getflightpocketbase = () => {
            const pb = new PocketBase('http://176.58.101.163:8080/');
            let beginning = new Date();
            beginning.setHours(0,0,0,0);
            beginning = new Date(Date.UTC(beginning.getFullYear(), beginning.getMonth(), beginning.getDate(), beginning.getHours(), beginning.getMinutes(), beginning.getSeconds(), beginning.getMilliseconds()));
            //Subtract 1 day
            beginning.setDate(beginning.getDate());

            let ending = new Date();
            ending.setHours(23,59,59,999);
            ending.setDate(ending.getDate() +1);

            ending = new Date(Date.UTC(ending.getFullYear(), ending.getMonth(), ending.getDate(), ending.getHours(), ending.getMinutes(), ending.getSeconds(), ending.getMilliseconds()));
            console.log('planned = ' + '"' + beginning.toISOString() + '"' + ' && ' + 'planned = ' + '"' + ending.toISOString() + '"');
            const resultlist = pb.collection('departures').getList(1,1000, {
                filter: 'planned >= ' + '"' + beginning.toISOString() + '"' + ' && ' + 'planned <= ' + '"' + ending.toISOString() + '"'
                      
                    
                }
            );
            resultlist.then((result) => {
                todaysflights = [];
                result.items.forEach((doc) => {
                    doc.planned = new Date(doc.planned);
                    if(doc.actual)
                        doc.actual = new Date(doc.actual);
                    if(doc.estimated)
                        doc.estimated = new Date(doc.estimated);
                    todaysflights.push(doc);
                    
                });
            })
                .catch((error) => {
                    console.log('Error getting documents: ', error);
                });

                console.table(todaysflights);
        }

        onMount(() => {
            getflightpocketbase();
        })

        

        







</script>

<div transition:fade id="titlecontainer">
    <h1 id="title">
        Departures Ilulissat <br/>{currentTime.toLocaleTimeString([],{hour12:false, hour: '2-digit', minute:'2-digit', second:'2-digit'})}
    </h1>
</div>

<div class="cardContainer">
{#each todaysflights as flight}

        <div class="card">
            {#if flight.status.en}
            <div class={flight.status.en == 'cancelled' ? 'cancelled' : 'delayed'}></div>
            {/if}
            <h1>{flight.rute}</h1>
            <p>Departure: {flight.departureairport}</p>
            {#if flight.estimated}
                <p>Estimated: {flight.estimated.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12:false})}</p>
                
                
            
            {:else}
                <p>Planned: {flight.planned.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12:false})}</p>
            {/if}

            
            <p>Destination: {flight.arrivalairport}</p>
            <p>Bus Departure: {flight.planned.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit',hour12:false})}</p>
            
            
            
        </div>



{/each}
</div>

<style>

    @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital@0;1&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Arvo&family=Barlow+Condensed:ital@0;1&display=swap');

    #title{
        text-align: center;
        font-family: 'Arvo', serif;
    }

    #titlecontainer{
        display: flex;
        justify-content: center;
        align-items: center;
        height: 4vh;
        width: 100vw;
        
    }

    .cancelled{
        /*This will sit on the top right corner of the parent div*/
        position: relative;
        align-self: flex-end;
        top: 0;
        right: 0;
        /*This will make the div a circle*/
        width: 1em;
        height: 1em;
        border-radius: 50%;
        /*This will make the div red*/
        background-color: red;
        /*The following will make the div overlap the margins of the siblings*/
        margin: -0.5em;




    }

    .delayed{
        /*This will sit on the top right corner of the parent div*/
        position: relative;
        align-self: flex-end;
        top: 0;
        right: 0;
        /*This will make the div a circle*/
        width: 1em;
        height: 1em;
        border-radius: 50%;
        /*This will make the div red*/
        background-color: yellow;
        /*The following will make the div overlap the margins of the siblings*/
        margin: -0.5em;
        font-size: xx-small;
    }
    

    .cardContainer{
        min-height: 90vh;
        min-width: 100vw;
        align-items: center;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-around;
    }
    .card{
        /*shadow effect*/
        box-shadow: 0 16px 8px 0 rgba(0,0,0,0.2);
        background: url("https://t3.ftcdn.net/jpg/04/95/22/44/360_F_495224491_wZ1fdpUEJcdZac332hiPiU20C2Z0a8Ak.jpg");
        background-size: 100% 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        margin: 1em;
        height: clamp(20rem, 20vw, 20rem);
        width: clamp(20rem, 20vw, 20rem);
        border-radius: 10px;
    }
    p{
        margin-right: 1em;
        margin-left: 1em;
    }

    .card > *{
        margin: 0.5em;
        text-align: center;
        font-size: 1.5em;
        color: chocolate;
        font-family: 'Arvo', serif;
    }

    h1{
        /*add an underline to the title*/
        text-decoration: underline;
    }
</style>
