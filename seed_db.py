import asyncio
import motor.motor_asyncio
from bson import ObjectId

MONGO_DETAILS = "mongodb://mongo:27017"
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_DETAILS)
database = client.nexus_db
roadmap_collection = database.get_collection("roadmaps")
challenge_collection = database.get_collection("challenges")

# --- TÜM YOL HARİTASI VERİLERİ ---
suggested_roadmaps_data = [
    # 1. Machine Learning Foundations
    {
        "title": "Machine Learning Foundations",
        "type": "suggested",
        "nodes": [
            {"nodeId": "1", "title": "Python Programming", "content": "Master Python basics, data structures, and control flow.", "dependencies": []},
            {"nodeId": "2", "title": "NumPy for Arrays", "content": "Learn numerical operations and N-dimensional arrays.", "dependencies": ["1"]},
            {"nodeId": "3", "title": "Pandas for DataFrames", "content": "Master data manipulation and analysis with DataFrames.", "dependencies": ["2"]},
            {"nodeId": "4", "title": "Matplotlib & Seaborn", "content": "Visualize data to find patterns and insights.", "dependencies": ["3"]},
            {"nodeId": "5", "title": "Calculus & Linear Algebra", "content": "Understand the core math behind ML algorithms (gradients, vectors).", "dependencies": ["1"]},
            {"nodeId": "6", "title": "Probability & Statistics", "content": "Grasp concepts like distributions, hypothesis testing, and Bayesian methods.", "dependencies": ["5"]},
            {"nodeId": "7", "title": "Intro to Scikit-Learn", "content": "Explore the most popular library for classical ML.", "dependencies": ["4", "6"]},
            {"nodeId": "8", "title": "Linear & Logistic Regression", "content": "Learn your first two supervised learning models for regression and classification.", "dependencies": ["7"]},
            {"nodeId": "9", "title": "Decision Trees & Random Forests", "content": "Understand tree-based models and ensemble methods.", "dependencies": ["8"]},
            {"nodeId": "10", "title": "Support Vector Machines (SVM)", "content": "Learn about maximum margin classifiers.", "dependencies": ["8"]},
            {"nodeId": "11", "title": "K-Means & PCA", "content": "Dive into unsupervised learning with clustering and dimensionality reduction.", "dependencies": ["7"]},
            {"nodeId": "12", "title": "Model Evaluation & Tuning", "content": "Learn about cross-validation, metrics, and hyperparameter tuning.", "dependencies": ["9", "10"]},
        ]
    },
    # 2. Full-Stack React & FastAPI
    {
        "title": "Full-Stack React & FastAPI",
        "type": "suggested",
        "nodes": [
            {"nodeId": "1", "title": "HTML, CSS, & JS", "content": "The fundamental trio of the web. Master the basics.", "dependencies": []},
            {"nodeId": "2", "title": "React & JSX", "content": "Learn component-based architecture with React.", "dependencies": ["1"]},
            {"nodeId": "3", "title": "State Management (useState, useEffect)", "content": "Handle component state and side effects with React Hooks.", "dependencies": ["2"]},
            {"nodeId": "4", "title": "React Router", "content": "Implement client-side routing for Single Page Applications (SPAs).", "dependencies": ["3"]},
            {"nodeId": "5", "title": "Advanced React (Context, Redux)", "content": "Manage global state effectively in large applications.", "dependencies": ["4"]},
            {"nodeId": "6", "title": "Python Basics", "content": "Get comfortable with Python syntax and data types.", "dependencies": []},
            {"nodeId": "7", "title": "Intro to FastAPI", "content": "Build your first high-performance API with automatic docs.", "dependencies": ["6"]},
            {"nodeId": "8", "title": "Pydantic Data Models", "content": "Define data shapes and validation for your API.", "dependencies": ["7"]},
            {"nodeId": "9", "title": "Async DB with Motor", "content": "Connect FastAPI to a MongoDB database using async methods.", "dependencies": ["8"]},
            {"nodeId": "10", "title": "API Routers & Dependencies", "content": "Structure your FastAPI application for scalability.", "dependencies": ["9"]},
            {"nodeId": "11", "title": "CORS & API Communication", "content": "Learn how to make your frontend and backend talk to each other securely.", "dependencies": ["5", "10"]},
            {"nodeId": "12", "title": "Deployment with Docker", "content": "Containerize and deploy your full-stack application.", "dependencies": ["11"]},
        ]
    },
    # 3. Python for Ethical Hacking
    {
        "title": "Python for Ethical Hacking",
        "type": "suggested",
        "nodes": [
            {"nodeId": "1", "title": "Python & Networking Basics", "content": "Understand sockets, TCP/IP, and HTTP in Python.", "dependencies": []},
            {"nodeId": "2", "title": "Scapy for Packet Crafting", "content": "Build and dissect network packets to understand protocols.", "dependencies": ["1"]},
            {"nodeId": "3", "title": "Network Scanner (Port/Host)", "content": "Write a script to discover hosts and open ports on a network.", "dependencies": ["2"]},
            {"nodeId": "4", "title": "Web Reconnaissance", "content": "Use libraries like `requests` and `BeautifulSoup` to scrape websites for information.", "dependencies": ["1"]},
            {"nodeId": "5", "title": "Vulnerability Scanner", "content": "Build a tool to scan for common web vulnerabilities like XSS and SQLi.", "dependencies": ["4"]},
            {"nodeId": "6", "title": "Brute-Force Attacks", "content": "Write scripts to automate login attempts against services.", "dependencies": ["4"]},
            {"nodeId": "7", "title": "Cryptography in Python", "content": "Learn about hashing and encryption libraries.", "dependencies": []},
            {"nodeId": "8", "title": "Reverse Shells", "content": "Create a simple reverse shell for remote access.", "dependencies": ["3"]},
            {"nodeId": "9", "title": "Malware Analysis Basics", "content": "Analyze simple malicious scripts.", "dependencies": ["8"]},
            {"nodeId": "10", "title": "Post-Exploitation Automation", "content": "Write scripts to automate tasks after gaining access.", "dependencies": ["9"]},
            {"nodeId": "11", "title": "API Hacking with Python", "content": "Learn to test and exploit API endpoints.", "dependencies": ["5"]},
        ]
    },
    # 4. Data Science Universe
    {
        "title": "Data Science Universe",
        "type": "suggested",
        "nodes": [
            {"nodeId": "1", "title": "Python for Data Science", "content": "Focus on data structures, functions, and libraries.", "dependencies": []},
            {"nodeId": "2", "title": "Pandas In-Depth", "content": "Master grouping, merging, and time-series analysis.", "dependencies": ["1"]},
            {"nodeId": "3", "title": "Advanced Visualization", "content": "Create interactive plots with Plotly and Dash.", "dependencies": ["2"]},
            {"nodeId": "4", "title": "Feature Engineering", "content": "Learn to create and select features that improve model performance.", "dependencies": ["2"]},
            {"nodeId": "5", "title": "Statistical Modeling", "content": "Go beyond basic stats into A/B testing and regression analysis.", "dependencies": ["4"]},
            {"nodeId": "6", "title": "Intro to Deep Learning", "content": "Build your first neural network with TensorFlow or PyTorch.", "dependencies": ["5"]},
            {"nodeId": "7", "title": "Natural Language Processing (NLP)", "content": "Work with text data, sentiment analysis, and topic modeling.", "dependencies": ["6"]},
            {"nodeId": "8", "title": "Computer Vision Basics", "content": "Learn image processing and build a simple image classifier.", "dependencies": ["6"]},
            {"nodeId": "9", "title": "Big Data with Spark", "content": "Get an introduction to distributed computing with PySpark.", "dependencies": ["2"]},
            {"nodeId": "10", "title": "Time Series Analysis", "content": "Learn forecasting techniques like ARIMA and Prophet.", "dependencies": ["5"]},
            {"nodeId": "11", "title": "Storytelling with Data", "content": "Learn to communicate your findings effectively through dashboards and reports.", "dependencies": ["3", "7", "8", "10"]},
        ]
    },
    # 5. DevOps Nebula
    {
        "title": "DevOps Nebula",
        "type": "suggested",
        "nodes": [
            {"nodeId": "1", "title": "Linux & Shell Scripting", "content": "Master the command line, permissions, and bash scripting.", "dependencies": []},
            {"nodeId": "2", "title": "Git for Version Control", "content": "Go beyond `commit` and `push`. Learn branching, rebasing, and workflows.", "dependencies": []},
            {"nodeId": "3", "title": "Docker In-Depth", "content": "Learn about multi-stage builds, networking, and Docker Compose.", "dependencies": ["1"]},
            {"nodeId": "4", "title": "CI/CD with GitHub Actions", "content": "Automate your testing and deployment pipelines.", "dependencies": ["2", "3"]},
            {"nodeId": "5", "title": "Cloud Fundamentals (AWS/GCP/Azure)", "content": "Understand core services like VMs, Storage, and Networking.", "dependencies": []},
            {"nodeId": "6", "title": "Infrastructure as Code (Terraform)", "content": "Define and manage your cloud infrastructure with code.", "dependencies": ["5"]},
            {"nodeId": "7", "title": "Kubernetes Basics", "content": "Learn container orchestration with Pods, Deployments, and Services.", "dependencies": ["3", "6"]},
            {"nodeId": "8", "title": "Monitoring & Alerting (Prometheus & Grafana)", "content": "Set up a monitoring stack to observe your applications.", "dependencies": ["7"]},
            {"nodeId": "9", "title": "Configuration Management (Ansible)", "content": "Automate the configuration of your servers.", "dependencies": ["1"]},
            {"nodeId": "10", "title": "Cloud Security Basics", "content": "Understand IAM, security groups, and secrets management.", "dependencies": ["5"]},
            {"nodeId": "11", "title": "Final Project: Deploy a Resilient App", "content": "Combine all skills to deploy a monitored, auto-scaling application.", "dependencies": ["4", "8", "10"]},
        ]
    },
    # 6. Game Dev with Godot
    {
        "title": "Game Dev with Godot",
        "type": "suggested",
        "nodes": [
            {"nodeId": "1", "title": "Godot Engine & Editor", "content": "Learn the interface, scenes, nodes, and signals.", "dependencies": []},
            {"nodeId": "2", "title": "GDScript Programming", "content": "Master the Python-like language of Godot.", "dependencies": ["1"]},
            {"nodeId": "3", "title": "2D Essentials", "content": "Create sprites, animations, tilemaps, and physics for a 2D game.", "dependencies": ["2"]},
            {"nodeId": "4", "title": "Building a 2D Platformer", "content": "Apply your 2D skills to create a complete platformer game.", "dependencies": ["3"]},
            {"nodeId": "5", "title": "UI & HUD Design", "content": "Create menus, health bars, and score displays.", "dependencies": ["2"]},
            {"nodeId": "6", "title": "3D Essentials", "content": "Learn about meshes, materials, lighting, and 3D physics.", "dependencies": ["2"]},
            {"nodeId": "7", "title": "Building a 3D FPS", "content": "Create a simple First-Person-Shooter to practice 3D skills.", "dependencies": ["6"]},
            {"nodeId": "8", "title": "Shaders & Visual Effects", "content": "Write simple shaders for custom visual effects.", "dependencies": ["4", "7"]},
            {"nodeId": "9", "title": "Sound & Music", "content": "Add sound effects and background music to your games.", "dependencies": ["5"]},
            {"nodeId": "10", "title": "Exporting & Publishing", "content": "Learn how to export your game for different platforms like Windows, Mac, and Web.", "dependencies": ["4", "7", "9"]},
        ]
    }
]

# --- ÖRNEK KODLAMA GÖREVLERİ VERİLERİ ---
code_challenges_data = [
    {
        "title": "Two Sum",
        "description": "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
        "difficulty": "Easy", "category": "Arrays",
        "template_code": "def two_sum(nums, target):\n    # Your code here\n    pass\n",
        "solution_code": "def two_sum(nums, target):\n    num_map = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in num_map:\n            return [num_map[complement], i]\n        num_map[num] = i\n    return []\n"
    },
    {
        "title": "Valid Parentheses",
        "description": "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets. Open brackets must be closed in the correct order.",
        "difficulty": "Easy", "category": "Strings & Stacks",
        "template_code": "def is_valid(s):\n    # Your code here\n    pass\n",
        "solution_code": "def is_valid(s):\n    stack = []\n    mapping = {')': '(', '}': '{', ']': '['}\n    for char in s:\n        if char in mapping:\n            top_element = stack.pop() if stack else '#'\n            if mapping[char] != top_element:\n                return False\n        else:\n            stack.append(char)\n    return not stack\n"
    },
    {
        "title": "Reverse a String",
        "description": "Write a function that reverses a string. The input string is given as an array of characters `s`.",
        "difficulty": "Easy", "category": "Strings",
        "template_code": "def reverse_string(s: list[str]) -> None:\n    \"\"\"\n    Do not return anything, modify s in-place instead.\n    \"\"\"\n    # Your code here\n    pass\n",
        "solution_code": "def reverse_string(s: list[str]) -> None:\n    s.reverse()\n"
    },
    {
        "title": "Maximum Subarray",
        "description": "Given an integer array `nums`, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.",
        "difficulty": "Medium", "category": "Arrays & Dynamic Programming",
        "template_code": "def max_subarray(nums: list[int]) -> int:\n    # Your code here\n    pass\n",
        "solution_code": "def max_subarray(nums: list[int]) -> int:\n    max_so_far = -float('inf')\n    max_ending_here = 0\n    for num in nums:\n        max_ending_here = max_ending_here + num\n        if max_so_far < max_ending_here:\n            max_so_far = max_ending_here\n        if max_ending_here < 0:\n            max_ending_here = 0\n    return max_so_far\n"
    }
]

# --- ANA SEED FONKSİYONU ---
async def seed_data():
    # Önce mevcut verileri sil
    print("Deleting existing suggested roadmaps and challenges...")
    await roadmap_collection.delete_many({"type": "suggested"})
    await challenge_collection.delete_many({})
    print("Deletion complete.")

    # Yol haritalarını eklemeden önce hazırla
    print("Preparing suggested roadmaps...")
    roadmaps_to_insert = []
    for roadmap_data in suggested_roadmaps_data:
        # Her bir nodea gerekli varsayılan alanları
        for node in roadmap_data["nodes"]:
            node["status"] = "not_started"
            node["chatHistory"] = []
        # Her roadmape progress 
        roadmap_data["progress"] = 0
        roadmaps_to_insert.append(roadmap_data)
    
    # Hazırlanan yol haritalarını veritabanına
    if roadmaps_to_insert:
        print(f"Inserting {len(roadmaps_to_insert)} roadmaps...")
        result = await roadmap_collection.insert_many(roadmaps_to_insert)
        print(f"Successfully inserted {len(result.inserted_ids)} roadmaps.")

    # Challenge'ları veritabanına 
    if code_challenges_data:
        print(f"Inserting {len(code_challenges_data)} challenges...")
        result = await challenge_collection.insert_many(code_challenges_data)
        print(f"Successfully inserted {len(result.inserted_ids)} challenges.")

    client.close()
    print("Database seeding complete.")

if __name__ == "__main__":
    asyncio.run(seed_data())