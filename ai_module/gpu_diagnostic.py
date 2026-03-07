"""
GPU Diagnostic Script for RTX 3050
Checks TensorFlow GPU configuration and CUDA installation
"""

import sys

print("=" * 60)
print("GPU DIAGNOSTIC REPORT")
print("=" * 60)

# 1. Check TensorFlow Installation
print("\n[1] TensorFlow Installation")
try:
    import tensorflow as tf
    print(f"✅ TensorFlow version: {tf.__version__}")
    print(f"   CUDA built: {tf.test.is_built_with_cuda()}")
except ImportError as e:
    print(f"❌ TensorFlow not installed: {e}")
    sys.exit(1)

# 2. Check Physical GPU Devices
print("\n[2] Physical GPU Detection")
try:
    gpus = tf.config.list_physical_devices('GPU')
    if gpus:
        print(f"✅ {len(gpus)} GPU(s) detected:")
        for i, gpu in enumerate(gpus):
            print(f"   GPU {i}: {gpu}")
    else:
        print("⚠️  No GPUs detected by TensorFlow")
        print("   Possible causes:")
        print("   - CUDA Toolkit not installed")
        print("   - cuDNN not installed")
        print("   - TensorFlow CPU-only version installed")
        print("   - GPU drivers outdated")
except Exception as e:
    print(f"❌ Error detecting GPUs: {e}")

# 3. Check CUDA Availability
print("\n[3] CUDA Availability")
try:
    cuda_available = tf.test.is_built_with_cuda()
    print(f"   Built with CUDA: {cuda_available}")
    
    if not cuda_available:
        print("   ⚠️  TensorFlow was built without CUDA support")
        print("   → Install: pip install tensorflow-gpu")
        print("   → Or use: pip install tensorflow[and-cuda]")
except Exception as e:
    print(f"❌ Error checking CUDA: {e}")

# 4. Check GPU Compute Capability
print("\n[4] GPU Compute Test")
try:
    if gpus:
        # Try a simple computation on GPU
        with tf.device('/GPU:0'):
            a = tf.constant([[1.0, 2.0], [3.0, 4.0]])
            b = tf.constant([[1.0, 1.0], [0.0, 1.0]])
            c = tf.matmul(a, b)
        print(f"✅ GPU computation successful")
        print(f"   Result: {c.numpy()}")
    else:
        print("⚠️  Skipping GPU test (no GPU detected)")
except Exception as e:
    print(f"❌ GPU computation failed: {e}")

# 5. System Information
print("\n[5] System Information")
try:
    import platform
    print(f"   OS: {platform.system()} {platform.release()}")
    print(f"   Python: {platform.python_version()}")
except Exception as e:
    print(f"❌ Error getting system info: {e}")

# 6. Recommendations
print("\n" + "=" * 60)
print("RECOMMENDATIONS")
print("=" * 60)

if not gpus:
    print("\n🔧 To enable GPU support for RTX 3050:")
    print("   1. Install NVIDIA CUDA Toolkit 11.8+")
    print("      Download: https://developer.nvidia.com/cuda-downloads")
    print("   2. Install cuDNN 8.6+")
    print("      Download: https://developer.nvidia.com/cudnn")
    print("   3. Install TensorFlow with GPU support:")
    print("      pip uninstall tensorflow")
    print("      pip install tensorflow[and-cuda]")
    print("   4. Restart your terminal/IDE")
    print("\n   Alternative (if above fails):")
    print("      pip install tensorflow-gpu==2.10.0")
else:
    print("\n✅ GPU is properly configured!")
    print("   Your RTX 3050 is ready for ML workloads.")

print("\n" + "=" * 60)
