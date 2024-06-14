<script>
    import {onDestroy, onMount} from 'svelte';
    import {page} from '$app/stores';
    import {PUBLIC_API_SERVER} from '$env/static/public';
    import {alertData} from '../../stores.js';
    import {goto} from '$app/navigation';
    import {
        Button,
        Container, Spinner
    } from '@sveltestrap/sveltestrap';
    import {userData} from "$lib/auth.js";
    import SvelteMarkdown from "svelte-markdown";

    let id = '';
    let userDataValue;
    let curriculum = "";
    let curriculum_phase = "";
    let motivation = '';

    let loading = false;

    const unsubscribeUserData = userData.subscribe(async (value) => {
        userDataValue = value;
    });

    onDestroy(() => {
        unsubscribeUserData
    });

    onMount(async () => {
        id = $page.url.searchParams.get('id'); // 다른 페이지에서 파라미터로 넘어오는 멘토 ID임
        if (!id) {
            await goto('/mentors'); // Redirect if no ID is provided
            alert('멘토 ID가 없습니다!');
            return;
        }

        await getCurriculum();

        if (!curriculum) {
            await generateCurriculum();
        }
    });

    // Get Curriculum
    async function getCurriculum() {
        const res = await fetch(PUBLIC_API_SERVER + '/prompt/' + id + '/curriculum', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': userDataValue.token
            },
        });

        const json = await res.json();
        if (!res.ok) {
            alertData.set({code: res.status, err: json});
        }
        curriculum = json["CURRICULUM"];
        curriculum_phase = json["PHASE"];
    }

    // Create New Curriculum
    async function generateCurriculum() {
        loading = true;

        const res = await fetch(PUBLIC_API_SERVER + '/prompt/' + id + '/curriculum', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': userDataValue.token
            },
            body: JSON.stringify({hint: ""})
        });

        const json = await res.json();
        if (!res.ok) {
            alertData.set({code: res.status, err: json.err});
            loading = false;
            return;
        }

        curriculum = json["CURRICULUM"];
        motivation = json["MOTIVATION"];
        loading = false;
    }
</script>

<Container fluid class="main-container">
    <Container fluid class="button-container">
        <Button class="recommend-button" on:click={generateCurriculum} disabled={loading}>
            {loading ? '로딩 중...' : '컬리큘럼 다시 추천받기'}
        </Button>
    </Container>

    {#if loading}
        <div class="loading-bar">
            <Spinner size="lg" />
        </div>
    {/if}

    {#if motivation}
        <Container fluid class="motivation-container">
            <h3>멘토로부터의 편지</h3>
            <p>{motivation}</p>
        </Container>
    {/if}

    {#if curriculum}
        <Container fluid class="curriculum-container">
            <h3>진행중인 컨리큘럼</h3>
            <SvelteMarkdown source={curriculum} />
        </Container>
    {/if}


    {#if curriculum_phase}
        <Container fluid class="curriculum-container">
            <h3>현재 나의 학습 현황</h3>
            <SvelteMarkdown source={curriculum_phase} />
        </Container>
    {/if}

    <style>
        .main-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px;
        }

        .button-container {
            display: flex;
            justify-content: center;
            margin-bottom: 20px;
            width: 100%;
        }

        .recommend-button {
            background-color: #007bff;
            color: white;
            font-size: 1.2em;
            padding: 10px 20px;
            border-radius: 5px;
            transition: background-color 0.3s ease;
        }

        .recommend-button:hover {
            background-color: #0056b3;
        }

        .loading-bar {
            display: flex;
            justify-content: center;
            margin-top: 20px;
            width: 100%;
        }

        .curriculum-container {
            width: 100%;
            max-width: 800px;
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            margin-bottom: 20px;
        }

        .motivation-container {
            width: 100%;
            max-width: 800px;
            background-color: #f9f9f9;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            text-align: center;
        }

        h3 {
            margin-bottom: 10px;
        }
    </style>
</Container>
