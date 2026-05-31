package com.shanghaikok.app

import android.annotation.SuppressLint
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.KeyEvent
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import java.net.URISyntaxException

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    // Vercel 기본 주소 (이곳을 커스텀 도메인이나 실제 Vercel 주소로 변경하여 빌드)
    private val webUrl = "https://shanghai2-rho.vercel.app/"

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // XML 레이아웃 파일 없이 동적으로 WebView를 생성하여 전체 화면으로 설정합니다.
        webView = WebView(this)
        setContentView(webView)

        // 웹뷰 설정 세팅
        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true // 환율 로컬스토리지 캐시 및 로컬 DB 활용에 필수적
        settings.useWideViewPort = true
        settings.loadWithOverviewMode = true
        settings.databaseEnabled = true
        settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW // 보안 하이브리드 지원
        
        // 웹 측에서 안드로이드 앱에서 접속했음을 정교하게 감지하도록 User-Agent에 고유 식별자 추가
        val defaultUserAgent = settings.userAgentString
        settings.userAgentString = "$defaultUserAgent ShanghaikokApp/Android"

        // 웹뷰 클라이언트 설정
        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                val url = request.url.toString()

                // 외부 딥링크 스키마 인터셉트 (고덕지도 및 인텐트 대응)
                if (url.startsWith("androidamap://") || url.startsWith("iosamap://") || url.startsWith("amapuri://")) {
                    try {
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                        intent.addCategory(Intent.CATEGORY_BROWSABLE)
                        intent.component = null
                        startActivity(intent)
                        return true
                    } catch (e: Exception) {
                        // 고덕지도가 설치되어 있지 않은 경우, 웹 Fallback 주소로 유연하게 리다이렉트
                        // 웹 브라우저 주소: https://uri.amap.com/
                        Toast.makeText(this@MainActivity, "고덕지도 앱이 설치되어 있지 않아 웹 지도로 전환합니다.", Toast.LENGTH_SHORT).show()
                        
                        // 고덕지도 앱이 없으면 플레이스토어로 연결하거나 웹용 지도 URL로 로드할 수 있습니다.
                        val playStoreIntent = Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=com.autonavi.minimap"))
                        try {
                            startActivity(playStoreIntent)
                        } catch (ex: Exception) {
                            startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://play.google.com/store/apps/details?id=com.autonavi.minimap")))
                        }
                        return true
                    }
                }

                // 일반적인 intent:// 스키마 파싱 지원 (카카오톡, 기타 외부 연동 대비)
                if (url.startsWith("intent:")) {
                    try {
                        val intent = Intent.parseUri(url, Intent.URI_INTENT_SCHEME)
                        val targetPackage = intent.`package` ?: intent.component?.packageName ?: ""
                        val existPackage = if (targetPackage.isNotEmpty()) {
                            packageManager.getLaunchIntentForPackage(targetPackage)
                        } else {
                            null
                        }
                        if (existPackage != null) {
                            startActivity(intent)
                        } else {
                            val fallbackUrl = intent.getStringExtra("browser_fallback_url")
                            if (fallbackUrl != null) {
                                view.loadUrl(fallbackUrl)
                            }
                        }
                        return true
                    } catch (e: URISyntaxException) {
                        return false
                    } catch (e: Exception) {
                        return false
                    }
                }

                // 일반 http/https 웹 링크는 웹뷰 내부에서 계속 로드
                if (url.startsWith("http://") || url.startsWith("https://")) {
                    return false
                }

                // 기타 외부 스키마(전화, 메일 등) 지원
                try {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                    startActivity(intent)
                    return true
                } catch (e: Exception) {
                    return false
                }
            }
        }

        // 웹 페이지 로드 시작
        webView.loadUrl(webUrl)
    }

    // 안드로이드 물리/제스처 뒤로가기 버튼 처리
    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        if (keyCode == KeyEvent.KEYCODE_BACK && webView.canGoBack()) {
            webView.goBack()
            return true
        }
        return super.onKeyDown(keyCode, event)
    }
}
