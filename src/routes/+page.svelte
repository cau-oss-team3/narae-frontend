<script>
    import {onDestroy} from 'svelte';
    import {goto} from '$app/navigation';
    import {base} from '$app/paths';
    import {Button, Container} from '@sveltestrap/sveltestrap';
    import {userData} from "$lib/auth.js";

    let userDataValue;

    const unsubscribe = userData.subscribe((value) => {
        userDataValue = value;
    });

    onDestroy(unsubscribe);

    const redirect = () => {
        if (userDataValue != null) {
            goto(base + '/mentors'); //멘토 리스트 페이지로 넘겨줌
        } else {
            goto(base + '/auth'); //로그인 페이지로 넘겨줌
        }
    };

    if (userDataValue != null) {
        redirect();
    }
</script>

<svelte:head>
    <title>나래: AI 멘토링 서비스</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Arial', sans-serif;
            overflow-x: hidden;
            background: linear-gradient(135deg, #6B73FF 0%, #000DFF 100%);
            position: relative;
            height: 100vh;
            color: white;
        }

        #background {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            z-index: -1;
        }

        .shape {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.1);
            animation: float 6s ease-in-out infinite;
        }

        .shape:nth-child(1) {
            width: 200px;
            height: 200px;
            top: 10%;
            left: 10%;
        }

        .shape:nth-child(2) {
            width: 300px;
            height: 300px;
            top: 60%;
            left: 80%;
            animation-delay: 2s;
        }

        .shape:nth-child(3) {
            width: 150px;
            height: 150px;
            top: 40%;
            left: 50%;
            animation-delay: 4s;
        }

        @keyframes float {
            0% {
                transform: translateY(0);
            }
            50% {
                transform: translateY(-20px);
            }
            100% {
                transform: translateY(0);
            }
        }

        .container {
            position: relative;
            background: rgba(0, 0, 0, 0.5);
            padding: 50px 20px;
            border-radius: 8px;
            animation: fadeIn 2s ease-in-out;
            margin-top: 10%;
        }

        h1 {
            font-size: 3rem;
            margin-bottom: 30px;
            animation: slideInFromLeft 1s ease-in-out;
        }

        .button-container {
            margin-top: 50px;
        }

        .btn-primary {
            background-color: #FF6B6B;
            border: none;
            font-size: 1.25rem;
            padding: 15px 30px;
            cursor: pointer;
            transition: background-color 0.3s ease;
            animation: pulse 2s infinite;
        }

        .btn-primary:hover {
            background-color: #FF4B4B;
        }

        .dev-info {
            margin-top: 20px;
            animation: fadeIn 3s ease-in-out;
        }

        .dev-info a {
            color: #FFD700;
            text-decoration: none;
        }

        .dev-info a:hover {
            text-decoration: underline;
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }

        @keyframes slideInFromLeft {
            from {
                transform: translateX(-100%);
            }
            to {
                transform: translateX(0);
            }
        }

        @keyframes pulse {
            0% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.05);
            }
            100% {
                transform: scale(1);
            }
        }
    </style>
</svelte:head>

<div id="background">
    <div class="shape"></div>
    <div class="shape"></div>
    <div class="shape"></div>
</div>

<Container class="py-5 text-center container-fluid">
    <h1>나래: 나만의 멘토와 함께 성장하세요</h1>
    <div class="button-container">
        <Button
                class="btn-primary"
                on:click={redirect}
        >
            서비스 사용해보기
        </Button>
    </div>
    <div class="dev-info">
        <p>Developed by <a href="https://github.com/cau-oss-team3" target="_blank">CAU OSS Team 3</a></p>
    </div>
</Container>
