import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침 | 상하이콕",
  description: "상하이콕 개인정보처리방침 및 광고 쿠키 안내",
};

export default function PrivacyPage() {
  return (
    <main className="pt-16 pb-24 px-4 bg-stone-50 min-h-screen">
      <h1 className="text-lg font-bold text-gray-900 mb-6">개인정보처리방침</h1>

      <div className="flex flex-col gap-6 text-sm leading-relaxed text-gray-700">
        <section>
          <h2 className="font-semibold text-gray-900 mb-1">1. 수집하는 정보</h2>
          <p>
            상하이콕(이하 &quot;서비스&quot;)은 회원가입 없이 이용 가능하며, 이용자가 직접 입력하는
            개인정보를 별도로 수집하지 않습니다. 서비스 이용 과정에서 기기 정보, 브라우저 정보,
            방문 페이지 등 비식별 이용 기록이 자동으로 생성될 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900 mb-1">2. 광고 서비스 및 쿠키</h2>
          <p>
            본 서비스는 Google AdSense를 통해 광고를 게재합니다. Google을 포함한 제3자 광고 사업자는
            쿠키를 사용하여 이용자의 이전 방문 기록을 바탕으로 광고를 게재할 수 있습니다. Google이
            광고 쿠키를 사용함으로써 이용자는 본 서비스 및 다른 사이트 방문 기록을 기반으로 한
            맞춤 광고를 제공받을 수 있습니다.
          </p>
          <p className="mt-2">
            이용자는{" "}
            <a
              href="https://adssettings.google.com/"
              target="_blank"
              rel="noreferrer noopener"
              className="text-red-500 underline"
            >
              Google 광고 설정
            </a>{" "}
            페이지에서 맞춤 광고를 비활성화할 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900 mb-1">3. 정보의 이용 목적</h2>
          <p>수집되는 비식별 정보는 서비스 품질 개선 및 광고 게재 목적으로만 사용됩니다.</p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900 mb-1">4. 문의</h2>
          <p>개인정보 관련 문의는 아래 이메일로 연락해 주세요.</p>
          <p className="mt-1 font-medium">hjm5158@gmail.com</p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900 mb-1">5. 시행일</h2>
          <p>본 방침은 2026년 7월 22일부터 적용됩니다.</p>
        </section>
      </div>
    </main>
  );
}
