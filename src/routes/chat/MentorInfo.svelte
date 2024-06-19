<script>
    import {Card, CardBody, CardHeader, CardSubtitle, CardText, CardTitle} from "@sveltestrap/sveltestrap";

    export let mentor_detail;

    const fieldCodeToString = (code) => {
        if (code == 0) {
            return '백엔드';
        } else if (code == 1) {
            return '프론트';
        } else if (code == 2) {
            return '백엔드, 프론트';
        } else {
            return '알수없음';
        }
    };
</script>

<style>
    .card-chat {
        margin-bottom: 20px;
        margin-left: auto;
        margin-right: auto;
        border: none;
        border-radius: 12px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        max-width: 600px;
        background-color: #ffffff;
        overflow: hidden;
    }

    .card-chat-header {
        background-color: #007bff;
        color: white;
        padding: 15px;
        text-align: center;
    }

    .card-chat-title {
        margin: 0;
        font-size: 1.5rem;
    }

    .card-chat-body {
        padding: 20px;
    }

    .card-chat-body-text {
        margin-bottom: 20px;
        font-size: 1rem;
        color: #555;
    }

    .card-chat-body-div {
        text-align: left;
        margin-top: 20px;
    }

    .card-chat-body-div-subtitle {
        font-size: 1.2rem;
        font-weight: bold;
        margin-bottom: 10px;
    }

    .card-chat-body-div-text {
        font-size: 1rem;
        color: #555;
    }

    .card-chat-body-div-text-info {
        font-size: 1rem;
        font-weight: bold;
        margin-bottom: 10px;
        color: #333;
    }

    .card-chat-body-div-text-sticc {
        font-size: 0.9rem;
        color: #555;
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    th, td {
        padding: 10px;
        text-align: left;
        border-bottom: 1px solid #ddd;
    }

    th {
        background-color: #f5f5f5;
    }
</style>

<div class="card-chat">
    <Card>
        <CardHeader class="card-chat-header">
            <CardTitle class="card-chat-title">
                {mentor_detail.mentor_name}
            </CardTitle>
        </CardHeader>
        <CardBody class="card-chat-body">
            <div class="card-chat-body-div">
                <CardSubtitle class="card-chat-body-div-subtitle">
                    현재 {fieldCodeToString(mentor_detail.mentor_field)} 분야의 멘토로 활동중입니다.
                </CardSubtitle>
                <CardText class="card-chat-body-div-text">
                    어떤 것을 도와드릴까요?
                </CardText>
                멘토링 상세 정보
                <table class="card-chat-body-div-text-sticc">
                    <tr>
                        <th>상황</th>
                        <td>{mentor_detail.mentor_sticc.situation}</td>
                    </tr>
                    <tr>
                        <th>작업</th>
                        <td>{mentor_detail.mentor_sticc.task}</td>
                    </tr>
                    <tr>
                        <th>의도</th>
                        <td>{mentor_detail.mentor_sticc.intent}</td>
                    </tr>
                    <tr>
                        <th>고민</th>
                        <td>{mentor_detail.mentor_sticc.concern}</td>
                    </tr>
                    <tr>
                        <th>추가 정보</th>
                        <td>{mentor_detail.mentor_sticc.calibrate}</td>
                    </tr>
                </table>
            </div>
        </CardBody>
    </Card>
</div>
