<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

$action = $_POST["action"] ?? "";
$email = $_POST["email"] ?? "";
$password = $_POST["password"] ?? "";

$file = "users.json";

if (!file_exists($file)) {
    file_put_contents($file, "[]");
}

$users = json_decode(file_get_contents($file), true);

if ($email == "" || $password == "") {
    echo "Please fill all fields.";
    exit;
}

if (strlen($password) < 5 || strlen($password) > 8) {
    echo "Password must be 5-8 characters.";
    exit;
}


/* SIGN UP */

if ($action == "signup") {

    foreach ($users as $user) {

        if ($user["email"] == $email) {
            echo "Email already registered.";
            exit;
        }
    }

    $users[] = [
        "email" => $email,
        "password" => $password
    ];

    file_put_contents(
        $file,
        json_encode($users, JSON_PRETTY_PRINT)
    );

    echo "signup_success";
    exit;
}


/* LOGIN */

if ($action == "login") {

    foreach ($users as $user) {

        if (
            $user["email"] == $email &&
            $user["password"] == $password
        ) {
            echo "login_success";
            exit;
        }
    }

    echo "Invalid email or password.";
    exit;
}

echo "Invalid request.";

?>