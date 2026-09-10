import os
import json
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage, HRFlowable, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY

PRIMARY_DARK = colors.HexColor("#173B3F")
SECONDARY_TEAL = colors.HexColor("#2E6F73")
SOFT_TEAL = colors.HexColor("#DCEDEC")
TEXT_MAIN = colors.HexColor("#172326")
TEXT_MUTED = colors.HexColor("#667477")
BORDER_COLOR = colors.HexColor("#DCE3E3")
BG_LIGHT = colors.HexColor("#F7F8F6")
WARNING_AMBER = colors.HexColor("#C98A3D")
DANGER_ROSE = colors.HexColor("#B94A48")
SUCCESS_PINE = colors.HexColor("#4D8061")

def generate_screening_pdf(
    pdf_output_path: str,
    screening_data: dict,
    patient_data: dict,
    prediction_data: dict,
    original_img_path: str,
    gradcam_img_path: str,
    reviewer_name: str = "Dr. S. K. Sharma (Medical Officer)"
):
    """
    Generates a production-grade clinical screening PDF report for Diabetic Retinopathy.
    """
    os.makedirs(os.path.dirname(pdf_output_path), exist_ok=True)
    doc = SimpleDocTemplate(
        pdf_output_path,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    # Custom Clinical Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=PRIMARY_DARK
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=13,
        textColor=SECONDARY_TEAL
    )
    
    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=PRIMARY_DARK,
        spaceAfter=6
    )
    
    body_style = ParagraphStyle(
        'BodyMain',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=TEXT_MAIN
    )
    
    bold_style = ParagraphStyle(
        'BodyBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=TEXT_MAIN
    )

    disclaimer_style = ParagraphStyle(
        'DisclaimerText',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8,
        leading=11,
        textColor=TEXT_MUTED,
        alignment=TA_JUSTIFY
    )

    story = []

    # 1. Header Banner
    header_data = [
        [
            Paragraph("<b>RetinaAI Clinical Screening Platform</b><br/><font size=8 color='#667477'>Rural Health Tele-Ophthalmology Decision Support | SIH Initiative</font>", title_style),
            Paragraph("<b>REPORT ID:</b> SCR-" + str(screening_data.get('id', 'N/A')).zfill(5) + "<br/><b>Date:</b> " + datetime.now().strftime("%d %b %Y, %H:%M"), ParagraphStyle('HRight', parent=body_style, alignment=TA_RIGHT))
        ]
    ]
    header_table = Table(header_data, colWidths=[360, 180])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(header_table)
    story.append(HRFlowable(width="100%", thickness=1.5, color=SECONDARY_TEAL, spaceBefore=4, spaceAfter=12))

    # 2. Patient & Screening Demographics Grid
    demographics_data = [
        [
            Paragraph("<b>Patient ID:</b> " + str(patient_data.get('patient_code', 'PT-UNKNOWN')), body_style),
            Paragraph("<b>Age / Gender:</b> " + f"{patient_data.get('age', '--')} yrs / {patient_data.get('sex', '--')}", body_style),
            Paragraph("<b>Diabetes Duration:</b> " + str(patient_data.get('diabetes_duration', 'Unknown')), body_style),
        ],
        [
            Paragraph("<b>Image Quality:</b> " + str(screening_data.get('image_quality', 'GOOD_QUALITY')), body_style),
            Paragraph("<b>Referral Urgency:</b> " + str(screening_data.get('referral_urgency', 'ROUTINE')), body_style),
            Paragraph("<b>Reviewer:</b> " + reviewer_name, body_style),
        ]
    ]
    demo_table = Table(demographics_data, colWidths=[180, 180, 180])
    demo_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), BG_LIGHT),
        ('BOX', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(demo_table)
    story.append(Spacer(1, 12))

    # 3. Primary Screening Result Box
    pred_label = prediction_data.get('predicted_label', 'Evaluation Pending')
    conf_val = float(prediction_data.get('confidence', 0.0)) * 100
    is_demo = prediction_data.get('is_demo_model', True)
    demo_tag = " [DEMO / DEVELOPMENT MODEL]" if is_demo else ""

    res_box_data = [
        [
            Paragraph(f"<b>AI-ASSISTED SCREENING RESULT:</b><br/><font size=13 color='#173B3F'><b>{pred_label.upper()}{demo_tag}</b></font>", body_style),
            Paragraph(f"<b>Model Confidence:</b><br/><font size=13 color='#2E6F73'><b>{conf_val:.1f}%</b></font>", ParagraphStyle('Conf', parent=body_style, alignment=TA_RIGHT))
        ]
    ]
    res_box = Table(res_box_data, colWidths=[400, 140])
    res_box.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), SOFT_TEAL),
        ('BOX', (0, 0), (-1, -1), 1, SECONDARY_TEAL),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(res_box)
    story.append(Spacer(1, 14))

    # 4. Dual Visual Evidence: Fundus Image & Grad-CAM Heatmap
    story.append(Paragraph("<b>Visual Evidence & Explainability (Grad-CAM Saliency)</b>", section_heading))
    
    img_row = []
    # Original Fundus
    if os.path.exists(original_img_path):
        img_row.append(RLImage(original_img_path, width=2.6*inch, height=2.3*inch))
    else:
        img_row.append(Paragraph("Original Fundus Image Placeholder", body_style))
        
    # Grad-CAM Overlay
    if os.path.exists(gradcam_img_path):
        img_row.append(RLImage(gradcam_img_path, width=2.6*inch, height=2.3*inch))
    else:
        img_row.append(Paragraph("Grad-CAM Overlay Placeholder", body_style))

    img_table = Table([
        img_row,
        [
            Paragraph("<b>Figure 1:</b> Captured Retinal Fundus Photograph", ParagraphStyle('Cap1', parent=body_style, alignment=TA_CENTER)),
            Paragraph("<b>Figure 2:</b> Grad-CAM Feature Attribution Overlay", ParagraphStyle('Cap2', parent=body_style, alignment=TA_CENTER))
        ]
    ], colWidths=[270, 270])
    img_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(img_table)
    story.append(Spacer(1, 10))

    # 5. Class Probability Distribution
    story.append(Paragraph("<b>Model Probability Distribution Across Severity Stages</b>", section_heading))
    probs = prediction_data.get('probabilities', {})
    if isinstance(probs, str):
        try:
            probs = json.loads(probs)
        except Exception:
            probs = {}

    prob_rows = [
        ["Class", "Severity Description", "Probability", "Assessment"]
    ]
    descriptions = {
        "No DR": "No visible microvascular abnormality",
        "Mild": "Microaneurysms only",
        "Moderate": "Multiple dot/blot hemorrhages, venous beading, hard exudates",
        "Severe": "Severe hemorrhages (4-2-1 rule), venous caliber irregularities",
        "Proliferative": "Neovascularization, pre-retinal/vitreous hemorrhage"
    }
    for k in ["No DR", "Mild", "Moderate", "Severe", "Proliferative"]:
        val = probs.get(k, 0.0)
        p_float = float(val) if val else 0.0
        prob_rows.append([
            k,
            descriptions.get(k, ""),
            f"{p_float * 100:.1f}%",
            "PREDICTED PRIMARY" if p_float == max([float(x) for x in probs.values()] or [0]) else "Differential"
        ])
    
    prob_table = Table(prob_rows, colWidths=[80, 280, 80, 100])
    prob_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_DARK),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 8.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT])
    ]))
    story.append(prob_table)
    story.append(Spacer(1, 12))

    # 6. Clinical Interpretation & Action
    story.append(Paragraph("<b>Clinical Interpretation & Recommendation</b>", section_heading))
    interp_text = prediction_data.get('interpretation', 'No interpretation available.')
    action_text = prediction_data.get('suggested_action', 'Consult a medical specialist.')

    action_box = [
        [Paragraph(f"<b>Key Retinal Observations:</b> {interp_text}", body_style)],
        [Paragraph(f"<b>Recommended Referral Action:</b> <u>{action_text}</u>", bold_style)]
    ]
    act_table = Table(action_box, colWidths=[540])
    act_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), BG_LIGHT),
        ('BOX', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(act_table)
    story.append(Spacer(1, 14))

    disclaimer_p = Paragraph(
        "<b>CLINICAL DISCLAIMER:</b> This report represents an AI-assisted screening output and is not a medical diagnosis. "
        "Professional ophthalmological evaluation is recommended. The AI severity classification and Grad-CAM saliency heatmaps "
        "are intended to assist preliminary triage and referral planning and do not determine autonomous medical treatment.",
        disclaimer_style
    )
    
    sig_data = [
        [
            disclaimer_p,
            Paragraph("____________________________<br/><b>Clinician Signature & Stamp</b><br/><font size=7 color='#667477'>Date: ___/___/20___</font>", ParagraphStyle('Sig', parent=body_style, alignment=TA_CENTER))
        ]
    ]
    sig_table = Table(sig_data, colWidths=[380, 160])
    sig_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(KeepTogether(sig_table))

    doc.build(story)
    return pdf_output_path
